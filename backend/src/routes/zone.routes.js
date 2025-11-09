import express from 'express';
import {
    getZones,
    createZone,
    updateZone,
    deleteZone,
} from '../controllers/zone.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getZones);
router.post('/', authorize('ADMIN', 'OPERATOR'), createZone);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateZone);
router.delete('/:id', authorize('ADMIN'), deleteZone);

export default router;
