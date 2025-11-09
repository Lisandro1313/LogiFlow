import prisma from '../config/database.js';

export const getAgents = async (req, res) => {
    try {
        const { isAvailable, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === 'true';
        }

        const [agents, total] = await Promise.all([
            prisma.deliveryAgent.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            isActive: true,
                        },
                    },
                    _count: {
                        select: {
                            routes: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.deliveryAgent.count({ where }),
        ]);

        res.json({
            agents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error al obtener repartidores:', error);
        res.status(500).json({ error: 'Error al obtener repartidores' });
    }
};

export const getAgentById = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await prisma.deliveryAgent.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                routes: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        orders: {
                            include: {
                                order: true,
                            },
                        },
                    },
                },
            },
        });

        if (!agent) {
            return res.status(404).json({ error: 'Repartidor no encontrado' });
        }

        res.json(agent);
    } catch (error) {
        console.error('Error al obtener repartidor:', error);
        res.status(500).json({ error: 'Error al obtener repartidor' });
    }
};

export const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            phone,
            vehicleType,
            licensePlate,
            isAvailable,
        } = req.body;

        const agent = await prisma.deliveryAgent.update({
            where: { id },
            data: {
                ...(phone && { phone }),
                ...(vehicleType && { vehicleType }),
                ...(licensePlate !== undefined && { licensePlate }),
                ...(isAvailable !== undefined && { isAvailable }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        res.json({
            message: 'Repartidor actualizado',
            agent,
        });
    } catch (error) {
        console.error('Error al actualizar repartidor:', error);
        res.status(500).json({ error: 'Error al actualizar repartidor' });
    }
};

export const getAgentStats = async (req, res) => {
    try {
        const { id } = req.params;

        const [completedRoutes, totalOrders, deliveredOrders, failedOrders] = await Promise.all([
            prisma.route.count({
                where: {
                    deliveryAgentId: id,
                    status: 'COMPLETED',
                },
            }),
            prisma.routeOrder.count({
                where: {
                    route: {
                        deliveryAgentId: id,
                    },
                },
            }),
            prisma.routeOrder.count({
                where: {
                    route: {
                        deliveryAgentId: id,
                    },
                    status: 'DELIVERED',
                },
            }),
            prisma.routeOrder.count({
                where: {
                    route: {
                        deliveryAgentId: id,
                    },
                    status: 'FAILED',
                },
            }),
        ]);

        const successRate = totalOrders > 0
            ? ((deliveredOrders / totalOrders) * 100).toFixed(2)
            : 0;

        res.json({
            completedRoutes,
            totalOrders,
            deliveredOrders,
            failedOrders,
            successRate: parseFloat(successRate),
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
