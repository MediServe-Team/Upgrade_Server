import invoiceIntoStockServices from '../services/invoiceIntoStock.services.js';

export default {
  filterProduct: async (req, res, next) => {
    try {
      const { search, categoryId } = req.query;
      const data = await invoiceIntoStockServices.filterProduct(search, categoryId);
      res.status(200).json({
        status: 200,
        message: 'filter product success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  filterHistory: async (req, res, next) => {
    try {
      const { fromDate, toDate, sort, pageNumber, limit } = req.query;
      const data = await invoiceIntoStockServices.filterHistory(fromDate, toDate, sort, pageNumber, limit);
      res.status(200).json({
        status: 200,
        message: 'filter history invoice into stock success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getInvoiceByDate: async (req, res, next) => {
    try {
      const { from, to, sort } = req.query;
      const data = await invoiceIntoStockServices.getInvoiceByDate(from, to, sort);
      res.status(200).json({
        status: 200,
        message: `get total invoice from ${from} to ${to} success`,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await invoiceIntoStockServices.getInvoiceById(id);
      res.json({
        status: 200,
        message: 'get an invoice success.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  createInvoice: async (req, res, next) => {
    try {
      const { staffId, totalImportPrice, totalSellPrice, note, listItem } = req.body;
      const invoiceInvo = { staffId, totalImportPrice, totalSellPrice, note };
      const data = await invoiceIntoStockServices.createNewInvoice(invoiceInvo, listItem);
      res.status(200).json({
        status: 200,
        message: 'create new invoice success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
