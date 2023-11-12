import express from 'express';
const router = express.Router();
import unitController from '../controllers/unit.controller.js';

//* [GET] /medicine-units/all   -> Get all unit of medicine
router.get('/all', unitController.getAllUnit);

//* [POST] /medicine-units/create   -> Create new medicine unit
router.post('/create', unitController.createNewUnit);

//* [DELETE] /medicine-units/delete/:id     -> Delete an unit of medicine
router.delete('/delete/:id', unitController.deleteUnit);

export default router;
