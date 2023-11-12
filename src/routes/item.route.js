import express from 'express';
const router = express.Router();
import itemController from '../controllers/item.controller.js';

// [GET] /items/filter?searchValue=""&categoryId=""
router.get('/filter', itemController.filterItem);

export default router;
