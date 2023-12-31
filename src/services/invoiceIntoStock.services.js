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
  getMerchandiseInventory: async () => {
    try {
      //* get all item in stock
      const itemInStockResults = await prisma.itemInStock.findMany({
        select: {
          invoiceIntoStockId: true,
          itemInStockId: true,
          lotNumber: true,
          manufactureDate: true,
          expirationDate: true,
          importQuantity: true,
          specification: true,
          importPrice: true,
          sellPrice: true,
          soldQuantity: true,
          destroyed: true,
          item: {
            select: {
              id: true,
              itemName: true,
              registrationNumber: true,
              packingSpecification: true,
              barCode: true,
              sellUnit: true,
              inputUnit: true,
              itemImage: true,
              itemType: true,
            },
          },
        },
      });

      //* detach merchandise for each status
      // 1. prepare sold out(sản phẩm sắp hết khi số lượng < 1/5 số lượng nhập)
      const preSoldOutMerchandise = itemInStockResults.filter((item) => {
        const inStockQnt = item.importQuantity - item.soldQuantity / item.specification;
        return inStockQnt < item.importQuantity / 5 && inStockQnt > 0;
      });
      // 2. prepare expired
      const preExpMerchandise = itemInStockResults.filter((item) => {
        const currentDate = new Date();
        const expDate = new Date(item.expirationDate);
        const nextThirtyDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expDate > currentDate && expDate <= nextThirtyDate;
      });
      // 3. expired
      const expMerchandise = itemInStockResults.filter((item) => {
        const currentDate = new Date();
        const expDate = new Date(item.expirationDate);
        return expDate <= currentDate;
      });

      // 4. all
      const allMerchandise = itemInStockResults.filter((item) => {
        const inStockQnt = item.importQuantity - item.soldQuantity / item.specification;
        return inStockQnt > 0;
      });

      return Promise.resolve({
        allMerchandise: allMerchandise,
        preSoldOutMerchandise,
        preExpMerchandise,
        expMerchandise,
      });
    } catch (err) {
      throw err;
    }
  },

  filterHistory: async (fromDate, toDate, sort, pageNumber, limit) => {
    try {
      //* defind option
      const skip = pageNumber && limit ? (Number(pageNumber) - 1) * Number(limit) : null;
      const order =
        sort && (sort.toLowerCase() === 'asc' || sort.toLowerCase() === 'desc') ? sort.toLowerCase() : 'desc';
      const whereClause = {
        ...(fromDate && toDate
          ? {
              createdAt: {
                gte: new Date(fromDate),
                lte: new Date(toDate),
              },
            }
          : {}),
      };

      //* Task get invoices with filter
      let getInvoices = () => {
        return new Promise(async (resolve) => {
          const invoices = await prisma.invoiceIntoStock.findMany({
            where: whereClause,
            ...(pageNumber && limit ? { skip: skip, take: Number(limit) } : {}),
            orderBy: { createdAt: order },
            include: { staff: { select: { fullName: true } } },
          });
          resolve(formatGroupInvoiceByDate(invoices));
        });
      };

      //*  Task count total Page base on data filter
      let countTotalPage = () => {
        return new Promise(async (resolve) => {
          const totalInvoices = await prisma.invoiceIntoStock.count({
            where: whereClause,
          });
          resolve(totalInvoices);
        });
      };

      const data = await Promise.all([getInvoices(), countTotalPage()]);
      return Promise.resolve({
        listGroupDate: data[0],
        currentPage: pageNumber,
        totalPage: Math.ceil(data[1] / limit),
      });
    } catch (err) {
      throw err;
    }
  },

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
                  sellUnit: true,
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
