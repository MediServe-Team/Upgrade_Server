import express from 'express';
const router = express.Router();
import receiptController from '../controllers/receipt.controller.js';

//* [GET] /receipt/of-user -> get all receipt of user
router.get('/of-user/:userId', receiptController.getReceiptOfUser);
//* [POST] /receipts/create     -> create a receipt
router.post('/create', receiptController.createReceipt);

export default router;
