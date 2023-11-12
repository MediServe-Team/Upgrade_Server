import itemServices from '../services/item.services.js';

export default {
  filterItem: async (req, res, next) => {
    try {
      const { searchValue, itemType, categoryId } = req.query;
      const data = await itemServices.filterItem(searchValue, itemType, categoryId);
      res.status(200).json({
        status: 200,
        message: 'filter item success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
