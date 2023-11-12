import itemInStockServices from '../services/itemInStock.services.js';

export default {
  filterItemInStock: async (req, res, next) => {
    try {
      const { searchValue, itemType } = req.query;
      const data = await itemInStockServices.filterItemInStock(searchValue, itemType);
      res.status(200).json({
        status: 200,
        message: `filter ${
          itemType === 'PRODUCT' ? 'product' : itemType === 'MEDICINE' ? 'medicine' : 'item'
        } in stocks success`,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
