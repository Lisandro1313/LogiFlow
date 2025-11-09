import express from 'express';
import {
    updateLocation,
    getAgentLocation,
    getAllActiveLocations,
} from '../controllers/tracking.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/location', updateLocation);
router.get('/agent/:agentId', getAgentLocation);
router.get('/active', getAllActiveLocations);

export default router;
