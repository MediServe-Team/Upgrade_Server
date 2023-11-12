import express from 'express';
const router = express.Router();
import medicineController from '../controllers/medicine.controller.js';

//* [POST] /medicines/create     -> create a medicine
router.post('/create', medicineController.createMedicine);

//* [PUT] /medicines/update/:id     -> update a medicine
router.put('/update/:id', medicineController.updateMedicine);

//* [DELETE] /medicines/delete/:id      -> delete a medicine
router.delete('/delete/:id', medicineController.deleteMedicine);

export default router;
