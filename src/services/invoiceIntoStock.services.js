import prisma from '../config/prisma.instance.js';
import createError from 'http-errors';
import { formatDate } from '../helpers/common.js';

const formatGroupInvoiceByDate = (invoices) => {
  const formatInvoice = invoices.reduce((result, item) => {
    const existDateIndex = result.findIndex((existItem) => existItem.createdAt === formatDate(item.createdAt));
    if (existDateIndex > -1) {
      result[existDateIndex].listInvoiceIndate.push(item);
    } else {
      result.push({ createdAt: formatDate(item.createdAt), listInvoiceIndate: [{ ...item }] });
    }

    return result;
  }, []);
  return formatInvoice;
};

export default {
  getInvoiceByDate: async (from, to, sort) => {
    try {
      if (!from || !to) return null;
      const order =
        sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc') ? sort.toLowerCase() : 'desc';
      // get invoice
      let getTotalInvoiceByDate = () => {
        return new Promise(async (resolve) => {
          const data = await prisma.invoiceIntoStock.findMany({
            where: {
              createdAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
            orderBy: { createdAt: order },
          });
          resolve(data);
        });
      };
      //   count total invoice
      let countTotalInvoice = () => {
        return new Promise(async (resolve, reject) => {
          const totalCount = await prisma.invoiceIntoStock.count({
            where: {
              createdAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
          });
          resolve(totalCount);
        });
      };
      const data = await Promise.all([getTotalInvoiceByDate(), countTotalInvoice()]);
      return Promise.resolve({ listInvoices: data[0], total: data[1] });
    } catch (err) {
      throw err;
    }
  },

  getInvoiceById: async (id) => {
    try {
      const invoiceResult = await prisma.invoiceIntoStock.findUnique({
        where: { id: Number(id) },
        include: {
          ItemInStocks: {
            include: {
              item: {
                select: {
                  itemName: true,
                  packingSpecification: true,
                  itemType: true,
                },
              },
            },
          },
        },
      });
      return Promise.resolve(invoiceResult);
    } catch (err) {
      throw err;
    }
  },

  createNewInvoice: async (invoiceInvo, listItem) => {
    try {
      // invoice create data
      const invoiceCreate = {};
      invoiceCreate.staffId = invoiceInvo.staffId;
      invoiceCreate.totalImportPrice = invoiceInvo.totalImportPrice;
      invoiceCreate.totalSellPrice = invoiceInvo.totalSellPrice;
      invoiceCreate.note = invoiceInvo.note;

      // logic with transaction:
      const createInvoiceTransaction = await prisma.$transaction(async (tx) => {
        // tx_1: create invoice
        const invoiceResult = await tx.invoiceIntoStock.create({ data: invoiceInvo });

        // list item in stock create data
        const itemInvos = listItem.map((itemInvo) => {
          const item = {};
          // implicit type
          item.importQuantity = Number(itemInvo.inputQuantity);
          item.specification = Number(itemInvo.specification);
          item.importPrice = Number(itemInvo.importPrice);
          item.sellPrice = Number(itemInvo.sellPrice);
          // add field
          item.itemId = itemInvo.id;
          item.lotNumber = itemInvo.lotNumber;
          item.invoiceIntoStockId = invoiceResult.id;
          item.manufactureDate = itemInvo.manufactureDate;
          item.expirationDate = itemInvo.expirationDate;
          // set default value
          item.soldQuantity = 0;
          item.destroyed = false;
          return item;
        });

        // tx_2: create item in stock
        const itemInStockResults = await tx.itemInStock.createMany({ data: itemInvos });

        // return data when transaction completed
        return { newInvoice: invoiceResult, newItems: itemInStockResults };
      });

      return Promise.resolve(createInvoiceTransaction);
    } catch (err) {
      throw err;
    }
  },
};
