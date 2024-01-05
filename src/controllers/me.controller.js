import meServices from '../services/me.services.js';
import checkinServices from '../services/v2/checkin.service.js';
import prescriptionService from '../services/prescription.service.js';
import receiptService from '../services/receipt.service.js';

export default {
  getProfile: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const data = await meServices.getUserById(userId);
      res.status(200).json({
        status: 200,
        messagae: 'get user profile success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  updateInfo: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const userUpdateInvo = req.body;

      const returnData = await meServices.updateProfileById(userId, userUpdateInvo);
      res.status(200).json({
        status: 200,
        message: 'update profile success',
        data: returnData,
      });
    } catch (err) {
      next(err);
    }
  },

  forGotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      await meServices.forGotPassword(email);
      res.status(200).json({
        status: 200,
        message: 'reset password information send to mail',
      });
    } catch (err) {
      next(err);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { email } = req.payload;
      const { password } = req.body;

      await meServices.resetUserPasswordByEmail(email, password);
      res.status(200).json({
        status: 200,
        message: 'reset password success.',
      });
    } catch (err) {
      next(err);
    }
  },

  userCheckin: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const result = await meServices.userCheckin(userId);
      res.status(200).json({
        status: 200,
        data: result,
        message: 'checkin success.',
      });
    } catch (err) {
      next(err);
    }
  },

  userCheckout: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      await meServices.userCheckout(userId);
      res.status(200).json({
        status: 200,
        message: 'checkout success.',
      });
    } catch (err) {
      next(err);
    }
  },

  getListCheckin: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const { month, year } = req.query;
      const results = await meServices.getListCheckin(userId, month, year);
      res.status(200).json({
        status: 200,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  getCheckinToday: async (req, res, next) => {
    try {
      const { userId } = req.payload;
      const result = await checkinServices.getCheckinToday(userId);
      res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getListBillsForCustomer: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const results = await receiptService.getReceiptOfUser(userId);
      res.status(200).json({
        status: 200,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  getListPrescritionForCustomer: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const results = await receiptService.getPrescriptionOfUser(userId);
      res.status(200).json({
        status: 200,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailPrescriptionForCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await receiptService.getDetailPrescription(id);
      res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
