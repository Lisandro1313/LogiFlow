import prisma from '../config/database.js';

export const getCustomers = async (req, res) => {
    try {
        const { search, zoneId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (zoneId) where.zoneId = zoneId;
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                include: {
                    zone: true,
                    _count: { select: { orders: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.customer.count({ where }),
        ]);

        res.json({
            customers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                zone: true,
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        items: true,
                    },
                },
            },
        });

        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Estadísticas del cliente
        const stats = await prisma.order.aggregate({
            where: { customerId: id },
            _count: true,
            _avg: { totalAmount: true },
            _sum: { totalAmount: true },
        });

        res.json({
            ...customer,
            stats: {
                totalOrders: stats._count,
                avgOrderAmount: stats._avg.totalAmount,
                totalSpent: stats._sum.totalAmount,
            },
        });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            latitude,
            longitude,
            zoneId,
        } = req.body;

        const customer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                address,
                latitude,
                longitude,
                zoneId,
            },
            include: {
                zone: true,
            },
        });

        res.status(201).json({
            message: 'Cliente creado exitosamente',
            customer,
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            latitude,
            longitude,
            zoneId,
            isActive,
        } = req.body;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(email !== undefined && { email }),
                ...(phone && { phone }),
                ...(address && { address }),
                ...(latitude && { latitude }),
                ...(longitude && { longitude }),
                ...(zoneId && { zoneId }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                zone: true,
            },
        });

        res.json({
            message: 'Cliente actualizado',
            customer,
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.customer.delete({
            where: { id },
        });

        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};
