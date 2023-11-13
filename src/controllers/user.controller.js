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
};
