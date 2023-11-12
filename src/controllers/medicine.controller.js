import medicineServices from '../services/medicine.services.js';

export default {

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
};
