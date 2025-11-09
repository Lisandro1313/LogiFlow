import prisma from '../config/database.js';

export const getUsers = async (req, res) => {
    try {
        const { role, isActive, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (role) where.role = role;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    deliveryAgent: true,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    deliveryAgent: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                deliveryAgent: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                deliveryAgent: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, role, isActive } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });

        res.json({
            message: 'Usuario actualizado',
            user,
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.userId) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
