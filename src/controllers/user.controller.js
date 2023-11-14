import userServices from '../services/user.services.js';

export default {
  getAllUser: async (req, res, next) => {
    try {
      const userResults = await userServices.getAllUser();
      res.status(200).json({
        status: 200,
        message: 'get all user success',
        data: userResults,
      });
    } catch (err) {
      next(err);
    }
  },

  getUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await userServices.getUserInfo(id);
      res.status(200).json({
        status: 200,
        message: 'get user infomation success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      await userServices.deleteUserById(id);
      res.status(200).json({
        status: 200,
        message: 'deleted user success',
      });
    } catch (err) {
      next(err);
    }
  },
};