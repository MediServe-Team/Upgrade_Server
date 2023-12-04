import express from 'express';
const router = express.Router();
import receiptController from '../controllers/receipt.controller.js';

//* [GET] /receipt/of-user -> get all receipt of user
router.get('/of-user/:userId', receiptController.getReceiptOfUser);

//* [GET] /receipts/filter  -> filter list receipt
router.get('/filter', receiptController.filterReceipts);

//* [GET] /receipts/detail/:id      -> get detail a receipt
router.get('/detail/:id', receiptController.getDetailReceipt);

//* [POST] /receipts/create     -> create a receipt
router.post('/create', receiptController.createReceipt);

export default router;
