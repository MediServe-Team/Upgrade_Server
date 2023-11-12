import express from 'express';
const router = express.Router();
import itemInStockController from '../controllers/itemInStock.controller.js';

// [GET] /item-in-stocks/filter?searchValue=""
router.get('/filter', itemInStockController.filterItemInStock);

export default router;
