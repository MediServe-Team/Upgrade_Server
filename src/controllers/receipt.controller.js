import receiptServices from '../services/receipt.service.js';

export default {
  getReceiptOfUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await receiptServices.getReceiptOfUser(userId);
      res.status(200).json({
        status: 200,
        message: 'get all receipt of user success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  filterReceipts: async (req, res, next) => {
    try {
      const { staffName, customerName, fromDate, toDate, sort, pageNumber, limit } = req.query;
      const data = await receiptServices.getAllReceiptWithCondition(
        staffName,
        customerName,
        fromDate,
        toDate,
        sort,
        pageNumber,
        limit,
      );
      res.status(200).json({
        status: 200,
        message: 'filter receipt success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  createReceipt: async (req, res, next) => {
    try {
      const { staffId, totalPayment, givenByCustomer, note, customerId, guest, products, medicines, newPrescriptions } =
        req.body;

      const newReceipt = {
        staffId,
        totalPayment,
        givenByCustomer,
        note,
      };

      const data = await receiptServices.createReceipt(
        newReceipt,
        guest,
        customerId,
        products,
        medicines,
        newPrescriptions,
      );

      res.status(201).json({
        status: 201,
        message: 'create new receipt success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
