import express from 'express';
import {
    getRoutes,
    getRouteById,
    createRoute,
    updateRouteStatus,
    optimizeRoute,
    deleteRoute,
} from '../controllers/route.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.post('/', authorize('ADMIN', 'OPERATOR'), createRoute);
router.post('/optimize', authorize('ADMIN', 'OPERATOR'), optimizeRoute);
router.put('/:id/status', authorize('ADMIN', 'OPERATOR', 'DELIVERY_AGENT'), updateRouteStatus);
router.delete('/:id', authorize('ADMIN'), deleteRoute);

export default router;
