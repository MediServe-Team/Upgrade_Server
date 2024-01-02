import storeServices from '../../services/v2/store.service.js';

export default {
  setActivity: async (req, res, next) => {
    try {
      const { isOpen } = req.body;
      await storeServices.setActivityStore(isOpen);
      res.status(200).json({
        status: 200,
        message: 'set store activity success',
      });
    } catch (err) {
      next(err);
    }
  },

  getActivity: async (req, res, next) => {
    try {
      const data = await storeServices.getActivityStore();
      res.status(200).json({
        status: 200,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
