import receiptServices from '../services/receipt.service.js';

export default {
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
