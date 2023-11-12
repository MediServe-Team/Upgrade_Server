import medicineServices from '../services/medicine.services.js';

export default {
  getMedicineByCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { pageNumber, limit, searchValue } = req.query;
      const data = await medicineServices.getMedicineByCategory(categoryId, pageNumber, limit, searchValue);
      res.status(200).json({
        status: 200,
        message: 'get medicines by category success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllMedicine: async (req, res, next) => {
    try {
      const { pageNumber, limit } = req.query;
      const data = await medicineServices.getAllMedicine(pageNumber, limit);
      res.status(200).json({
        status: 200,
        message: 'get medicine with pagination success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailMedicine: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await medicineServices.getMedicineById(id);
      res.status(200).json({
        status: 200,
        message: 'get detail medicine success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  createMedicine: async (req, res, next) => {
    try {
      const dataCreateInvo = req.body;
      const data = await medicineServices.createMedicine(dataCreateInvo);
      res.status(201).json({
        status: 201,
        message: 'create new medicine success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  updateMedicine: async (req, res, next) => {
    try {
      const { id } = req.params;
      const dataUpdateInvo = req.body;
      const data = await medicineServices.updateMedicineById(id, dataUpdateInvo);
      res.status(200).json({
        status: 200,
        message: 'update a medicine success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteMedicine: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await medicineServices.deleteMedicineById(id);
      res.status(200).json({
        status: 200,
        message: 'Delete medicine success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
