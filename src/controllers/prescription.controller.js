import prescriptionServices from '../services/prescription.service.js';

export default {
  createPrescription: async (req, res, next) => {
    try {
      const { staffId, diagnose, isDose, note, listMedicines } = req.body;
      const prescriptionInvo = { staffId, diagnose, isDose, note };

      const data = await prescriptionServices.createNewPrescription(prescriptionInvo, listMedicines);
      res.status(201).json({
        status: 201,
        message: 'create new prescription success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  updatePrescription: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { diagnose, note, listMedicines } = req.body;
      const prescriptionInvo = { diagnose, note };
      const data = await prescriptionServices.updatePrescription(id, prescriptionInvo, listMedicines);
      res.status(200).json({
        status: 200,
        message: 'update a prescription success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getaAllPrescription: async (req, res, next) => {
    try {
      const data = await prescriptionServices.getAllPrescription();
      res.status(200).json({
        status: 200,
        message: 'get all prescription success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailPrescription: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await prescriptionServices.getPresciptionById(id);
      res.status(200).json({
        status: 200,
        message: 'get a prescription success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  filterPrescription: async (req, res, next) => {
    try {
      const { searchValue } = req.query;
      const data = await prescriptionServices.filterPrescription(searchValue);
      res.status(200).json({
        status: 200,
        message: 'filter prescription success!',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  deletePrescription: async (req, res, next) => {
    try {
      const { id } = req.params;
      await prescriptionServices.deletePrescription(id);
      res.status(200).json({
        status: 200,
        message: 'Delete a prescription success',
      });
    } catch (err) {
      next(err);
    }
  },
};
