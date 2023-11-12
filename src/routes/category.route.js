import express from 'express';
const router = express.Router();
import categoryController from '../controllers/category.controller.js';

//* [GET] /categories/all   -> Get all category
router.get('/all', categoryController.getAllCategory);

//* [GET] /categories/:id   -> Get a category
router.get('/:id', categoryController.getOneCategory);

//* [POST] /categories/create      -> Create a category
router.post('/create', categoryController.createCategory);

//* [PUT] /categories/update/:id     -> Delete a category
router.put('/update/:id', categoryController.updateCategory);

//* [DELETE] /categories/delete/:id     -> Delete a category
router.delete('/delete/:id', categoryController.deleteCategory);

export default router;
