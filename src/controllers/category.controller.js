import categoryServices from '../services/category.service.js';

export default {
  getAllCategory: async (req, res, next) => {
    try {
      const data = await categoryServices.getAllCategory();
      res.status(200).json({
        status: 200,
        message: 'get all category success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getOneCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await categoryServices.getCategoryById(id);
      res.status(200).json({
        status: 200,
        message: 'get a category success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  createCategory: async (req, res, next) => {
    try {
      const { categoryName, isMedicine, isDefault, note } = req.body;
      const newCategory = { categoryName, isMedicine, isDefault, note };
      const returnData = await categoryServices.createCategory(newCategory);
      res.status(200).json({
        status: 201,
        message: 'create new category succes',
        data: returnData,
      });
    } catch (err) {
      next(err);
    }
  },

  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { categoryName, isMedicine, note } = req.body;
      const newCategory = { categoryName, isMedicine, note };
      const returnData = await categoryServices.updateCategoryById(id, newCategory);
      res.status(200).json({
        status: 200,
        message: 'update category success',
        data: returnData,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const returnData = await categoryServices.deleteCategoryById(id);
      res.status(200).json({
        status: 200,
        message: 'delete category success',
        data: returnData,
      });
    } catch (err) {
      next(err);
    }
  },
};
