import express from 'express';
const router = express.Router();
import invoiceIntoStockController from '../controllers/invoiceIntoStock.controller.js';

//* [GET] /invoice-into-stocks/filter-history -> Get invoice with paging group by date
router.get('/filter-history', invoiceIntoStockController.filterHistory);

//* [GET] /invoice-into-stocks/bydate?from=""&to=""
router.get('/by-date', invoiceIntoStockController.getInvoiceByDate);
//* [GET] /invoice-into-stocks/:id      -> Get detail invoice into stock
router.get('/:id', invoiceIntoStockController.getDetailInvoice);

//* [POST] /invoice-into-stocks/create      -> Create an invoice into stock
router.post('/create', invoiceIntoStockController.createInvoice);

export default router;
