import express from 'express';
const router = express.Router();
import meController from '../controllers/me.controller.js';
import { verifyAccessToken, verifyResetPasswordToken } from '../helpers/jwt.service.js';

//* [GET] /me/profile   -> Get my profile
router.get('/profile', verifyAccessToken, meController.getProfile);

//* [PUT] /me/update-info     -> Edit my profile
router.put('/update-info', verifyAccessToken, meController.updateInfo);

//* [PUT] /me/change-password   -> Request change password
router.put('/forgot-password', meController.forGotPassword);

//* [PUT] /me/reset-password/:token -> reset password
router.put('/reset-password/:token', verifyResetPasswordToken, meController.resetPassword);

router.post('/checkin', verifyAccessToken, meController.userCheckin);

router.put('/checkout', verifyAccessToken, meController.userCheckout);

router.get('/list-checkin', verifyAccessToken, meController.getListCheckin);

router.get('/checkin-today', verifyAccessToken, meController.getCheckinToday);

router.get('/receipts/user/:userId', meController.getListBillsForCustomer);

router.get('/prescriptions/user/:userId', meController.getListPrescritionForCustomer);

router.get('/prescriptions/:id', meController.getDetailPrescriptionForCustomer);

export default router;
