import prescriptionController from '../controllers/prescription.controller.js';
import express from 'express';
const router = express.Router();

//* [POST] /prescriptions/create    -> Create new prescription
router.post('/create', prescriptionController.createPrescription);

export default router;
