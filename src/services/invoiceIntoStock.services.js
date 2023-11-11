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
