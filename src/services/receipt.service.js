import prisma from '../config/prisma.instance.js';
import presciptionServices from './prescription.service.js';
import createError from 'http-errors';

export default {
  getReceiptOfUser: async (userId) => {
    try {
      const data = await prisma.receipt.findMany({
        where: {
          customerId: userId,
        },
        include: {
          staff: {
            select: { fullName: true },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  getAllReceiptWithCondition: async (staffName, customerName, fromDate, toDate, sort, pageNumber, limit) => {
    try {
      //* defind option
      const skip = pageNumber && limit ? (Number(pageNumber) - 1) * Number(limit) : null;
      const order =
        sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc') ? sort.toLowerCase() : 'desc';
      const whereClause = {
        ...(staffName ? { staff: { fullName: { contains: staffName, mode: 'insensitive' } } } : {}),
        ...(customerName
          ? {
              OR: [
                { customer: { fullName: { contains: customerName, mode: 'insensitive' } } },
                { guest: { fullName: { contains: customerName, mode: 'insensitive' } } },
              ],
            }
          : {}),
        ...(fromDate && toDate
          ? {
              createdAt: {
                gte: new Date(fromDate),
                lte: new Date(toDate),
              },
            }
          : {}),
      };

      //* Task get receipts with filter
      let getReceipts = () => {
        return new Promise(async (resolve) => {
          const receipts = await prisma.receipt.findMany({
            where: whereClause,
            include: {
              staff: { select: { fullName: true } },
              customer: { select: { fullName: true } },
              guest: { select: { fullName: true } },
            },
            ...(pageNumber && limit ? { skip: skip, take: Number(limit) } : {}),
            orderBy: { createdAt: order },
          });
          resolve(receipts);
        });
      };

      //*  Task count total Page base on data filter
      let countTotalPage = () => {
        return new Promise(async (resolve) => {
          const totalReceipts = await prisma.receipt.count({
            where: whereClause,
          });
          resolve(totalReceipts);
        });
      };

      //* Excute above task
      const data = await Promise.all([getReceipts(), countTotalPage()]);

      return Promise.resolve({ receipts: data[0], currentPage: pageNumber, totalPage: Math.ceil(data[1] / limit) });
    } catch (err) {
      throw err;
    }
  },

  getReceiptById: async (id) => {
    try {
      const data = await prisma.receipt.findUnique({
        where: { id: Number(id) },
        select: {
          //* receipts
          id: true,
          totalPayment: true,
          givenByCustomer: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          staff: {
            select: {
              fullName: true,
            },
          },
          //* list item
          DetailReceiptItems: {
            select: {
              quantity: true,
              totalPrice: true,
              itemInStock: {
                select: {
                  sellPrice: true,
                  item: {
                    select: {
                      itemName: true,
                      sellUnit: true,
                      packingSpecification: true,
                      itemType: true,
                    },
                  },
                },
              },
            },
          },
          //* list presctiptions
          DetailReceiptPrescriptions: {
            select: {
              quantity: true,
              totalPrice: true,
              prescription: {
                select: {
                  diagnose: true,
                  totalPrice: true,
                  note: true,
                  MedicineGuideSells: {
                    select: {
                      morning: true,
                      noon: true,
                      night: true,
                      quantity: true,
                      totalPrice: true,
                      note: true,
                      medicine: {
                        select: {
                          sellPrice: true,
                          item: {
                            select: {
                              itemName: true,
                              sellUnit: true,
                              packingSpecification: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  staff: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
            },
          },
          //* customer
          customer: {
            select: {
              id: true,
              fullName: true,
              dateOfBirth: true,
              gender: true,
              address: true,
            },
          },
          guest: true,
        },
      });
      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  createReceipt: async (receiptInvo, guestInvo, customerId, products, medicines, newPrescriptions) => {
    try {
      //! check enough quantity item
      const listItemUpdateQnt = [];
      //! product qnt
      if (products && Array.isArray(products)) {
        products.map((item) => {
          let itemCheckQnt = {
            itemId: Number(item.productId),
            quantity: Number(item.quantity),
          };
          listItemUpdateQnt.push(itemCheckQnt);
        });
      }
      //! medicine qnt
      if (medicines && Array.isArray(medicines)) {
        medicines.map((item) => {
          let itemCheckQnt = {
            itemId: Number(item.medicineId),
            quantity: Number(item.quantity),
          };
          listItemUpdateQnt.push(itemCheckQnt);
        });
      }
      //! precription
      if (newPrescriptions && Array.isArray(newPrescriptions)) {
        newPrescriptions.map((presciption) => {
          if (presciption?.listMedicines && Array.isArray(presciption.listMedicines)) {
            presciption.listMedicines.map((mc) => {
              let existIndex = listItemUpdateQnt.findIndex((item) => item.itemId === mc.medicineId);
              if (existIndex !== -1) {
                listItemUpdateQnt[existIndex].quantity += mc.quantity;
              } else {
                listItemUpdateQnt.push({ itemId: mc.medicineId, quantity: mc.quantity });
              }
            });
          }
        });
      }

      await Promise.all(
        listItemUpdateQnt.map(async (item) => {
          let itemInStock = await prisma.itemInStock.findFirst({
            where: {
              itemInStockId: Number(item.itemId),
            },
            select: {
              importQuantity: true,
              soldQuantity: true,
              specification: true,
              item: { select: { itemName: true, sellUnit: true } },
            },
          });
          // check qnt
          let itemInStockQnt =
            Number(itemInStock.importQuantity * itemInStock.specification) - Number(itemInStock.soldQuantity);
          if (itemInStockQnt < item.quantity) {
            throw createError.BadRequest(
              `${itemInStock.item.itemName} chỉ còn lại ${itemInStockQnt} ${itemInStock.item.sellUnit} trong kho, không đủ ${item.quantity} ${itemInStock.item.sellUnit}`,
            );
          }
        }),
      );

      //* receipt create data
      const receiptCreate = {};
      receiptCreate.staffId = receiptInvo?.staffId;
      receiptCreate.totalPayment = receiptInvo?.totalPayment;
      receiptCreate.givenByCustomer = receiptInvo?.givenByCustomer;
      receiptCreate.note = receiptInvo?.note;

      const data = await prisma.$transaction(async (tx) => {
        //* check guest or customer
        if (customerId) {
          receiptCreate.customerId = customerId;
        } else {
          if (Object.keys(guestInvo).length === 0) throw createError.BadRequest('Invalid information of customer!');
          //* guest create data
          const guestCreate = {};
          guestCreate.fullName = guestInvo?.fullName;
          guestCreate.age = guestInvo?.age;
          guestCreate.gender = guestInvo?.gender;
          guestCreate.address = guestInvo?.address;
          //* create new guest
          const guestCreateResult = await tx.guest.create({ data: guestCreate });
          receiptCreate.guestId = guestCreateResult.id;
        }

        //* create new receipt
        const receiptResult = await tx.receipt.create({ data: receiptCreate });

        //! Promise create detail receipt item
        const createDetailReceiptItem = () =>
          new Promise(async (resolve) => {
            //* detail receipt data create
            const detailReceiptItemCreates = [];

            //* push detail_receipt_item product
            await Promise.all(
              products.map(async (product) => {
                // push product detail receipt
                const detailItem = {
                  receiptId: receiptResult.id,
                  itemInStockId: product.productId,
                  quantity: product.quantity,
                  totalPrice: product.totalPrice,
                };
                detailReceiptItemCreates.push(detailItem);
              }),
            );

            //* push detail_receipt_item medicine
            await Promise.all(
              medicines.map(async (medicine) => {
                // push product detail receipt
                const detailItem = {
                  receiptId: receiptResult.id,
                  itemInStockId: medicine.medicineId,
                  quantity: medicine.quantity,
                  totalPrice: medicine.totalPrice,
                };
                detailReceiptItemCreates.push(detailItem);
              }),
            );
            //* create detail_receipt_item
            const detailReceiptItemResults = await tx.detailReceiptItem.createMany({ data: detailReceiptItemCreates });

            return resolve(detailReceiptItemResults);
          });

        //! Promise create detail prescription for new dose
        const createDetailPresReceipt = () =>
          new Promise(async (resolve) => {
            // create new dose and return array data to create detail receipt
            if (newPrescriptions) {
              const listDetailPresReceipts = await Promise.all(
                newPrescriptions.map(async (pres) => {
                  //* new prescription create data
                  const prescriptionCreate = {};
                  prescriptionCreate.staffId = receiptInvo.staffId;
                  prescriptionCreate.diagnose = pres.diagnose;
                  prescriptionCreate.isDose = false;
                  prescriptionCreate.note = pres.note;
                  //* create prescription
                  const prescriptionCreateResult = await presciptionServices.createNewPrescriptionForSell(
                    prescriptionCreate,
                    pres.listMedicines,
                  );
                  return {
                    receiptId: receiptResult.id,
                    prescriptionId: prescriptionCreateResult.newPrescription.id,
                    quantity: pres.quantity ?? 0,
                    totalPrice: pres.totalPrice,
                  };
                }),
              );
              // create detail prescription receipt
              const detailReceiptPresResults = await tx.detailReceiptPrescription.createMany({
                data: listDetailPresReceipts,
              });
              return resolve(detailReceiptPresResults);
            }
            return resolve({});
          });

        //* Excute create receipt:
        const data = await Promise.all([createDetailReceiptItem(), createDetailPresReceipt()]);
        //* Update quantity in stock:
        //! update sold_quantity of item in stock
        await Promise.all(
          listItemUpdateQnt.map(async (item) => {
            await tx.itemInStock.update({
              where: { itemInStockId: Number(item.itemId) },
              data: {
                soldQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }),
        );

        return Promise.resolve({ receiptResult, data });
      });

      return Promise.resolve(data);
    } catch (err) {
      throw err;
    }
  },

  getPrescriptionOfUser: async (userId) => {
    try {
      const data = await prisma.prescription.findMany({
        where: {
          DetailReceiptPrescriptions: {
            some: {
              receipt: {
                customerId: userId,
              },
            },
          },
          isDose: false,
        },
        select: {
          id: true,
          diagnose: true,
          totalPrice: true,
          note: true,
          updatedAt: true,
          DetailReceiptPrescriptions: {
            select: {
              totalPrice: true,
            },
          },
          staff: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      data.map((item) => {
        item.totalPrice = item.DetailReceiptPrescriptions[0].totalPrice;
        delete item.DetailReceiptPrescriptions;
      });

      return data;
    } catch (err) {
      throw err;
    }
  },

  getDetailPrescription: async (id) => {
    try {
      const data = await prisma.prescription.findFirst({
        where: { id: Number(id) },
        select: {
          diagnose: true,
          totalPrice: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          MedicineGuideSells: {
            select: {
              morning: true,
              noon: true,
              night: true,
              quantity: true,
              totalPrice: true,
              note: true,
              medicine: {
                select: {
                  sellPrice: true,
                  item: {
                    select: {
                      itemName: true,
                      sellUnit: true,
                      packingSpecification: true,
                    },
                  },
                },
              },
            },
          },
          staff: {
            select: {
              fullName: true,
            },
          },
        },
      });
      return data;
    } catch (err) {
      throw err;
    }
  },
};
