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
};
