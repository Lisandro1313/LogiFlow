import prisma from '../config/database.js';

export const getZones = async (req, res) => {
    try {
        const zones = await prisma.zone.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        customers: true,
                        orders: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json(zones);
    } catch (error) {
        console.error('Error al obtener zonas:', error);
        res.status(500).json({ error: 'Error al obtener zonas' });
    }
};

export const createZone = async (req, res) => {
    try {
        const { name, description, polygon, color } = req.body;

        const zone = await prisma.zone.create({
            data: {
                name,
                description,
                polygon,
                color: color || '#3B82F6',
            },
        });

        res.status(201).json({
            message: 'Zona creada exitosamente',
            zone,
        });
    } catch (error) {
        console.error('Error al crear zona:', error);
        res.status(500).json({ error: 'Error al crear zona' });
    }
};

export const updateZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, polygon, color, isActive } = req.body;

        const zone = await prisma.zone.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(polygon && { polygon }),
                ...(color && { color }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        res.json({
            message: 'Zona actualizada',
            zone,
        });
    } catch (error) {
        console.error('Error al actualizar zona:', error);
        res.status(500).json({ error: 'Error al actualizar zona' });
    }
};

export const deleteZone = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.zone.delete({
            where: { id },
        });

        res.json({ message: 'Zona eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar zona:', error);
        res.status(500).json({ error: 'Error al eliminar zona' });
    }
};
