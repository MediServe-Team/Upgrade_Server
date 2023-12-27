import meServices from '../services/me.services.js';

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
      await meServices.userCheckin(userId);
      res.status(200).json({
        status: 200,
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
};
