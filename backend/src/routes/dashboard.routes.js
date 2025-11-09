import express from 'express';
import { getDashboardStats, getOrderTrends } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/trends', getOrderTrends);

export default router;
