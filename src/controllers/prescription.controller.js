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
};
