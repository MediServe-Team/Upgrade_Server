import prescriptionController from '../controllers/prescription.controller.js';
import express from 'express';
const router = express.Router();

//* [GET] /prescriptions/all    -> Get all precriptions
router.get('/all', prescriptionController.getaAllPrescription);

//* [POST] /prescriptions/create    -> Create new prescription
router.post('/create', prescriptionController.createPrescription);

//* [PUT] /prescriptions/update/:id     -> Update a prescription
router.put('/update/:id', prescriptionController.updatePrescription);

export default router;
