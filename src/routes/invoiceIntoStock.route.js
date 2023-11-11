import express from 'express';
const router = express.Router();
import invoiceIntoStockController from '../controllers/invoiceIntoStock.controller.js';

//* [GET] /invoice-into-stocks/:id      -> Get detail invoice into stock
router.get('/:id', invoiceIntoStockController.getDetailInvoice);

//* [POST] /invoice-into-stocks/create      -> Create an invoice into stock
router.post('/create', invoiceIntoStockController.createInvoice);

export default router;
