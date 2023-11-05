import productServices from '../services/product.services.js';

export default {
  filterProduct: async (req, res, next) => {
    try {
      // const { searchValue } = req.query;
      // const data = await productServices.fiterProduct(searchValue);
      // res.status(200).json({
      //   status: 200,
      //   message: 'filter products success',
      //   data,
      // });
    } catch (err) {
      next(err);
    }
  },

  getProductByCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { pageNumber, limit, searchValue } = req.query;
      const data = await productServices.getProductByCategory(categoryId, pageNumber, limit, searchValue);
      res.status(200).json({
        status: 200,
        message: 'get products by category success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllProduct: async (req, res, next) => {
    try {
      const { pageNumber, limit } = req.query;
      const data = await productServices.getAllProduct(pageNumber, limit);
      res.status(200).json({
        status: 200,
        message: 'get product with pagination success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await productServices.getProductById(id);
      res.status(200).json({
        status: 200,
        message: 'get detail product success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const dataCreateInvo = req.body;
      const data = await productServices.createProduct(dataCreateInvo);
      res.status(201).json({
        status: 201,
        message: 'create new product success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dataUpdateInvo = req.body;
      const data = await productServices.updateProductById(id, dataUpdateInvo);
      res.status(200).json({
        status: 200,
        message: 'update a product success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await productServices.deleteProducById(id);
      res.status(200).json({
        status: 200,
        message: 'Delete product success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
