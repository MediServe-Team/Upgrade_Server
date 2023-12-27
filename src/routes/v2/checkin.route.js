import express from 'express';
const router = express.Router();
import checkinController from '../../controllers/v2/checkin.controller.js';

router.get('/of-user/:userId', checkinController.getListCheckinOfUser);

export default router;
