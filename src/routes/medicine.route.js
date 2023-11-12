import express from 'express';
const router = express.Router();
import medicineController from '../controllers/medicine.controller.js';

//* [POST] /medicines/create     -> create a medicine
router.post('/create', medicineController.createMedicine);
export default router;
