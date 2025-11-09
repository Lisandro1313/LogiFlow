import prisma from '../config/database.js';
import axios from 'axios';

export const getRoutes = async (req, res) => {
    try {
        const { status, agentId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (agentId) where.deliveryAgentId = agentId;
        if (dateFrom || dateTo) {
            where.routeDate = {};
            if (dateFrom) where.routeDate.gte = new Date(dateFrom);
            if (dateTo) where.routeDate.lte = new Date(dateTo);
        }

        const [routes, total] = await Promise.all([
            prisma.route.findMany({
                where,
                include: {
                    deliveryAgent: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    orders: {
                        include: {
                            order: {
                                include: {
                                    customer: true,
                                },
                            },
                        },
                        orderBy: { sequence: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.route.count({ where }),
        ]);

        res.json({
            routes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error al obtener rutas:', error);
        res.status(500).json({ error: 'Error al obtener rutas' });
    }
};

export const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;

        const route = await prisma.route.findUnique({
            where: { id },
            include: {
                deliveryAgent: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                orders: {
                    include: {
                        order: {
                            include: {
                                customer: true,
                                items: true,
                            },
                        },
                    },
                    orderBy: { sequence: 'asc' },
                },
            },
        });

        if (!route) {
            return res.status(404).json({ error: 'Ruta no encontrada' });
        }

        res.json(route);
    } catch (error) {
        console.error('Error al obtener ruta:', error);
        res.status(500).json({ error: 'Error al obtener ruta' });
    }
};

export const createRoute = async (req, res) => {
    try {
        const {
            routeName,
            deliveryAgentId,
            routeDate,
            orderIds,
        } = req.body;

        const route = await prisma.route.create({
            data: {
                routeName,
                deliveryAgentId,
                routeDate: new Date(routeDate),
                status: 'PENDING',
            },
        });

        // Asignar pedidos a la ruta
        if (orderIds && orderIds.length > 0) {
            await Promise.all(
                orderIds.map((orderId, index) =>
                    prisma.routeOrder.create({
                        data: {
                            routeId: route.id,
                            orderId,
                            sequence: index + 1,
                            status: 'ASSIGNED',
                        },
                    })
                )
            );

            // Actualizar estado de los pedidos
            await prisma.order.updateMany({
                where: { id: { in: orderIds } },
                data: { status: 'ASSIGNED' },
            });
        }

        const createdRoute = await prisma.route.findUnique({
            where: { id: route.id },
            include: {
                deliveryAgent: {
                    include: {
                        user: true,
                    },
                },
                orders: {
                    include: {
                        order: true,
                    },
                    orderBy: { sequence: 'asc' },
                },
            },
        });

        // Emitir evento WebSocket
        const io = req.app.get('io');
        io.emit('route-created', createdRoute);

        res.status(201).json({
            message: 'Ruta creada exitosamente',
            route: createdRoute,
        });
    } catch (error) {
        console.error('Error al crear ruta:', error);
        res.status(500).json({ error: 'Error al crear ruta' });
    }
};

export const updateRouteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = { status };

        if (status === 'IN_PROGRESS' && !updateData.startedAt) {
            updateData.startedAt = new Date();

            // Actualizar pedidos a IN_TRANSIT
            await prisma.routeOrder.updateMany({
                where: { routeId: id },
                data: { status: 'IN_TRANSIT' },
            });

            const routeOrders = await prisma.routeOrder.findMany({
                where: { routeId: id },
                select: { orderId: true },
            });

            await prisma.order.updateMany({
                where: { id: { in: routeOrders.map(ro => ro.orderId) } },
                data: { status: 'IN_TRANSIT' },
            });
        }

        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();

            if (updateData.startedAt) {
                const route = await prisma.route.findUnique({ where: { id } });
                if (route?.startedAt) {
                    const actualTime = Math.floor((new Date() - route.startedAt) / 60000);
                    updateData.actualTime = actualTime;
                }
            }
        }

        const route = await prisma.route.update({
            where: { id },
            data: updateData,
            include: {
                deliveryAgent: {
                    include: {
                        user: true,
                    },
                },
                orders: {
                    include: {
                        order: true,
                    },
                },
            },
        });

        // Emitir evento WebSocket
        const io = req.app.get('io');
        io.emit('route-updated', route);

        res.json({
            message: 'Estado de ruta actualizado',
            route,
        });
    } catch (error) {
        console.error('Error al actualizar ruta:', error);
        res.status(500).json({ error: 'Error al actualizar ruta' });
    }
};

export const optimizeRoute = async (req, res) => {
    try {
        const { orderIds } = req.body;

        if (!orderIds || orderIds.length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar pedidos' });
        }

        // Obtener pedidos con coordenadas
        const orders = await prisma.order.findMany({
            where: {
                id: { in: orderIds },
                deliveryLat: { not: null },
                deliveryLng: { not: null },
            },
            include: {
                customer: true,
            },
        });

        if (orders.length === 0) {
            return res.status(400).json({ error: 'No hay pedidos con coordenadas válidas' });
        }

        // Llamar al microservicio de IA para optimizar
        try {
            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
            const response = await axios.post(`${aiServiceUrl}/optimize-route`, {
                orders: orders.map(o => ({
                    id: o.id,
                    lat: o.deliveryLat,
                    lng: o.deliveryLng,
                    address: o.deliveryAddress,
                })),
            });

            const optimizedData = response.data;

            res.json({
                message: 'Ruta optimizada',
                optimizedRoute: optimizedData.route,
                totalDistance: optimizedData.totalDistance,
                estimatedTime: optimizedData.estimatedTime,
                orders: optimizedData.orderedPoints.map(p => {
                    const order = orders.find(o => o.id === p.id);
                    return {
                        ...order,
                        sequence: p.sequence,
                    };
                }),
            });
        } catch (aiError) {
            console.log('AI Service no disponible, usando fallback simple');

            // Fallback: orden simple por latitud
            const sorted = orders
                .sort((a, b) => a.deliveryLat - b.deliveryLat)
                .map((order, index) => ({
                    ...order,
                    sequence: index + 1,
                }));

            res.json({
                message: 'Ruta ordenada (sin optimización IA)',
                orders: sorted,
                totalDistance: null,
                estimatedTime: null,
            });
        }
    } catch (error) {
        console.error('Error al optimizar ruta:', error);
        res.status(500).json({ error: 'Error al optimizar ruta' });
    }
};

export const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.route.delete({
            where: { id },
        });

        res.json({ message: 'Ruta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar ruta:', error);
        res.status(500).json({ error: 'Error al eliminar ruta' });
    }
};
