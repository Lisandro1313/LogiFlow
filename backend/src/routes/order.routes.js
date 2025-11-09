import express from 'express';
import multer from 'multer';
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    generateOrderPDF,
    importOrders,
    getOrderStats,
} from '../controllers/order.controller.js';
import { authMiddleware, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configurar multer para carga de archivos
const upload = multer({ storage: multer.memoryStorage() });

// Rutas protegidas
router.use(authMiddleware);

router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);
router.post('/', authorize('ADMIN', 'OPERATOR'), createOrder);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateOrder);
router.delete('/:id', authorize('ADMIN'), deleteOrder);
router.get('/:id/pdf', generateOrderPDF);
router.post('/import', authorize('ADMIN', 'OPERATOR'), upload.single('file'), importOrders);

export default router;
