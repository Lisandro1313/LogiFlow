import prisma from '../config/database.js';

export const updateLocation = async (req, res) => {
    try {
        const { agentId, latitude, longitude, status, speed, battery, orderId } = req.body;

        const trackingLog = await prisma.trackingLog.create({
            data: {
                deliveryAgentId: agentId,
                orderId,
                latitude,
                longitude,
                status,
                speed,
                battery,
            },
        });

        // Emitir ubicación via WebSocket
        const io = req.app.get('io');
        io.emit('agent-location', {
            agentId,
            latitude,
            longitude,
            status,
            speed,
            timestamp: trackingLog.timestamp,
        });

        res.json({
            message: 'Ubicación actualizada',
            trackingLog,
        });
    } catch (error) {
        console.error('Error al actualizar ubicación:', error);
        res.status(500).json({ error: 'Error al actualizar ubicación' });
    }
};

export const getAgentLocation = async (req, res) => {
    try {
        const { agentId } = req.params;

        const location = await prisma.trackingLog.findFirst({
            where: { deliveryAgentId: agentId },
            orderBy: { timestamp: 'desc' },
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
            },
        });

        if (!location) {
            return res.status(404).json({ error: 'No se encontró ubicación' });
        }

        res.json(location);
    } catch (error) {
        console.error('Error al obtener ubicación:', error);
        res.status(500).json({ error: 'Error al obtener ubicación' });
    }
};

export const getAllActiveLocations = async (req, res) => {
    try {
        const agents = await prisma.deliveryAgent.findMany({
            where: { isAvailable: true },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        const locations = await Promise.all(
            agents.map(async (agent) => {
                const lastLocation = await prisma.trackingLog.findFirst({
                    where: { deliveryAgentId: agent.id },
                    orderBy: { timestamp: 'desc' },
                });

                return {
                    agent: {
                        id: agent.id,
                        name: `${agent.user.firstName} ${agent.user.lastName}`,
                        vehicleType: agent.vehicleType,
                    },
                    location: lastLocation || null,
                };
            })
        );

        res.json(locations.filter(l => l.location !== null));
    } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
        res.status(500).json({ error: 'Error al obtener ubicaciones' });
    }
};
