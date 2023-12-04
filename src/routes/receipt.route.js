import express from 'express';
const router = express.Router();
import receiptController from '../controllers/receipt.controller.js';
//* [POST] /receipts/create     -> create a receipt
router.post('/create', receiptController.createReceipt);

export default router;
