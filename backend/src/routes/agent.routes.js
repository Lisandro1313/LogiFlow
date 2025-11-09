import express from 'express';
import {
    getAgents,
    getAgentById,
    updateAgent,
    getAgentStats,
} from '../controllers/agent.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAgents);
router.get('/:id', getAgentById);
router.get('/:id/stats', getAgentStats);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateAgent);

export default router;
