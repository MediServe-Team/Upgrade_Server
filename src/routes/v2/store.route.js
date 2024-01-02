import express from 'express';
const router = express.Router();
import storeController from '../../controllers/v2/store.controller.js';

router.put('/activity', storeController.setActivity);

router.get('/activity', storeController.getActivity);
export default router;
