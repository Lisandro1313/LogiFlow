import express from 'express';
import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from '../controllers/customer.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize('ADMIN', 'OPERATOR'), createCustomer);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateCustomer);
router.delete('/:id', authorize('ADMIN'), deleteCustomer);

export default router;
