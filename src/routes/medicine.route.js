import express from 'express';
const router = express.Router();
import medicineController from '../controllers/medicine.controller.js';


//* [GET] /medicines/paginate     -> get all medicine
router.get('/paginate', medicineController.getAllMedicine);

//* [GET] /medicines/details/:id     -> get detail a medicine
router.get('/detail/:id', medicineController.getDetailMedicine);

//* [POST] /medicines/create     -> create a medicine
router.post('/create', medicineController.createMedicine);

//* [PUT] /medicines/update/:id     -> update a medicine
router.put('/update/:id', medicineController.updateMedicine);

//* [DELETE] /medicines/delete/:id      -> delete a medicine
router.delete('/delete/:id', medicineController.deleteMedicine);

export default router;
