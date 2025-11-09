import prisma from '../config/database.js';

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            inTransitOrders,
            deliveredToday,
            failedToday,
            activeAgents,
            totalCustomers,
            ordersByStatus,
            ordersByZone,
            recentOrders,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({
                where: { createdAt: { gte: today } },
            }),
            prisma.order.count({
                where: { status: 'PENDING' },
            }),
            prisma.order.count({
                where: { status: 'IN_TRANSIT' },
            }),
            prisma.order.count({
                where: {
                    status: 'DELIVERED',
                    updatedAt: { gte: today },
                },
            }),
            prisma.order.count({
                where: {
                    status: 'FAILED',
                    updatedAt: { gte: today },
                },
            }),
            prisma.deliveryAgent.count({
                where: { isAvailable: true },
            }),
            prisma.customer.count(),
            prisma.order.groupBy({
                by: ['status'],
                _count: true,
            }),
            prisma.order.groupBy({
                by: ['zoneId'],
                _count: true,
                where: {
                    zoneId: { not: null },
                },
            }),
            prisma.order.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: true,
                    zone: true,
                },
            }),
        ]);

        // Calcular tasa de éxito
        const totalDelivered = deliveredToday + failedToday;
        const successRate = totalDelivered > 0
            ? ((deliveredToday / totalDelivered) * 100).toFixed(2)
            : 100;

        // Calcular tiempo promedio (simulado por ahora)
        const avgDeliveryTime = 45; // minutos

        res.json({
            overview: {
                totalOrders,
                todayOrders,
                pendingOrders,
                inTransitOrders,
                deliveredToday,
                failedToday,
                activeAgents,
                totalCustomers,
                successRate: parseFloat(successRate),
                avgDeliveryTime,
            },
            ordersByStatus: ordersByStatus.map(item => ({
                status: item.status,
                count: item._count,
            })),
            ordersByZone: ordersByZone.map(item => ({
                zoneId: item.zoneId,
                count: item._count,
            })),
            recentOrders,
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

export const getOrderTrends = async (req, res) => {
    try {
        const { days = 7 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));
        startDate.setHours(0, 0, 0, 0);

        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
                status: true,
            },
        });

        // Agrupar por día
        const ordersByDay = {};
        orders.forEach(order => {
            const day = order.createdAt.toISOString().split('T')[0];
            if (!ordersByDay[day]) {
                ordersByDay[day] = { total: 0, delivered: 0, failed: 0 };
            }
            ordersByDay[day].total++;
            if (order.status === 'DELIVERED') ordersByDay[day].delivered++;
            if (order.status === 'FAILED') ordersByDay[day].failed++;
        });

        const trends = Object.keys(ordersByDay).map(date => ({
            date,
            ...ordersByDay[date],
        }));

        res.json({ trends });
    } catch (error) {
        console.error('Error al obtener tendencias:', error);
        res.status(500).json({ error: 'Error al obtener tendencias' });
    }
};
