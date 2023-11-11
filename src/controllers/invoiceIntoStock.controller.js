import invoiceIntoStockServices from '../services/invoiceIntoStock.services.js';

export default {
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
