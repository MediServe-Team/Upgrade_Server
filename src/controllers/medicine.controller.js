import medicineServices from '../services/medicine.services.js';

export default {

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
