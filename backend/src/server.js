import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import orderRoutes from './routes/order.routes.js';
import customerRoutes from './routes/customer.routes.js';
import agentRoutes from './routes/agent.routes.js';
import routeRoutes from './routes/route.routes.js';
import zoneRoutes from './routes/zone.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import trackingRoutes from './routes/tracking.routes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io para WebSockets
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
        credentials: true,
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compartir io con las rutas
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'LogiFlow API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tracking', trackingRoutes);

// WebSocket connection
io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on('join-agent-room', (agentId) => {
        socket.join(`agent-${agentId}`);
        console.log(`👤 Agente ${agentId} se unió a su sala`);
    });

    socket.on('location-update', (data) => {
        // Broadcast a todos los operadores
        io.emit('agent-location', data);
        console.log(`📍 Ubicación actualizada: ${data.agentId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log('');
    console.log('🚚 ============================================');
    console.log('   LogiFlow API Server');
    console.log('============================================ 🚚');
    console.log('');
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSockets activos en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('============================================');
    console.log('');
});

export { io };
