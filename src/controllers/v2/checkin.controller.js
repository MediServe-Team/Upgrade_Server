import checkinServices from '../../services/v2/checkin.service.js';
import meServices from '../../services/me.services.js';

export default {
  getListCheckinOfUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
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
