import prisma from '../config/database.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';

// Listar todos los pedidos con filtros
export const getOrders = async (req, res) => {
    try {
        const {
            status,
            zoneId,
            priority,
            dateFrom,
            dateTo,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) where.status = status;
        if (zoneId) where.zoneId = zoneId;
        if (priority) where.priority = priority;

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) where.createdAt.lte = new Date(dateTo);
        }

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { deliveryAddress: { contains: search, mode: 'insensitive' } },
                { customer: { firstName: { contains: search, mode: 'insensitive' } } },
                { customer: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    customer: true,
                    zone: true,
                    items: true,
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.order.count({ where }),
        ]);

        res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// Obtener un pedido por ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                zone: true,
                items: true,
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                routes: {
                    include: {
                        route: {
                            include: {
                                deliveryAgent: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
                trackingLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                },
                deliveryPhotos: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
};

// Crear nuevo pedido
export const createOrder = async (req, res) => {
    try {
        const {
            customerId,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            zoneId,
            priority,
            scheduledDate,
            scheduledTimeSlot,
            notes,
            items,
        } = req.body;

        // Generar número de orden único
        const lastOrder = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { orderNumber: true },
        });

        const lastNumber = lastOrder
            ? parseInt(lastOrder.orderNumber.split('-')[1])
            : 1000;
        const orderNumber = `ORD-${String(lastNumber + 1).padStart(5, '0')}`;

        // Calcular total
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.unitPrice * item.quantity);
        }, 0);

        // Generar QR Code
        const qrCode = await QRCode.toDataURL(orderNumber);

        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId,
                deliveryAddress,
                deliveryLat,
                deliveryLng,
                zoneId,
                priority: priority || 'NORMAL',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                scheduledTimeSlot,
                totalAmount,
                notes,
                qrCode,
                createdById: req.user.userId,
                items: {
                    create: items.map(item => ({
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.unitPrice * item.quantity,
                    })),
                },
            },
            include: {
                customer: true,
                items: true,
                zone: true,
            },
        });

        // Emitir evento WebSocket
        const io = req.app.get('io');
        io.emit('order-created', order);

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            order,
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
};

// Actualizar pedido
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            zoneId,
            status,
            priority,
            scheduledDate,
            scheduledTimeSlot,
            notes,
        } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: {
                ...(deliveryAddress && { deliveryAddress }),
                ...(deliveryLat && { deliveryLat }),
                ...(deliveryLng && { deliveryLng }),
                ...(zoneId && { zoneId }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
                ...(scheduledTimeSlot && { scheduledTimeSlot }),
                ...(notes !== undefined && { notes }),
            },
            include: {
                customer: true,
                items: true,
                zone: true,
            },
        });

        // Emitir evento WebSocket
        const io = req.app.get('io');
        io.emit('order-updated', order);

        res.json({
            message: 'Pedido actualizado',
            order,
        });
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
};

// Eliminar pedido
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.order.delete({
            where: { id },
        });

        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
};

// Generar PDF del pedido
export const generateOrderPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: true,
                zone: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido-${order.orderNumber}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('LogiFlow', 50, 50);
        doc.fontSize(10).text('Comprobante de Pedido', 50, 75);
        doc.moveDown();

        // Información del pedido
        doc.fontSize(12).text(`Pedido: ${order.orderNumber}`, { underline: true });
        doc.fontSize(10);
        doc.text(`Fecha: ${order.createdAt.toLocaleDateString()}`);
        doc.text(`Estado: ${order.status}`);
        doc.text(`Prioridad: ${order.priority}`);
        doc.moveDown();

        // Cliente
        doc.fontSize(12).text('Cliente:', { underline: true });
        doc.fontSize(10);
        doc.text(`${order.customer.firstName} ${order.customer.lastName}`);
        doc.text(`Tel: ${order.customer.phone}`);
        doc.text(`Dirección: ${order.deliveryAddress}`);
        doc.moveDown();

        // Items
        doc.fontSize(12).text('Productos:', { underline: true });
        doc.moveDown(0.5);

        let y = doc.y;
        doc.fontSize(9);
        doc.text('Producto', 50, y);
        doc.text('Cant.', 300, y);
        doc.text('P. Unit.', 350, y);
        doc.text('Total', 450, y);

        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 10;

        order.items.forEach(item => {
            doc.text(item.productName, 50, y);
            doc.text(item.quantity.toString(), 300, y);
            doc.text(`$${item.unitPrice.toFixed(2)}`, 350, y);
            doc.text(`$${item.totalPrice.toFixed(2)}`, 450, y);
            y += 20;
        });

        y += 10;
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 15;

        doc.fontSize(12).text(`Total: $${order.totalAmount.toFixed(2)}`, 450, y, {
            width: 100,
            align: 'right',
        });

        // QR Code (si existe)
        if (order.qrCode) {
            const qrBuffer = Buffer.from(order.qrCode.split(',')[1], 'base64');
            doc.image(qrBuffer, 50, y + 30, { width: 100 });
        }

        doc.end();
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ error: 'Error al generar PDF' });
    }
};

// Importación masiva desde Excel
export const importOrders = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const createdOrders = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                // Buscar o crear cliente
                let customer = await prisma.customer.findFirst({
                    where: {
                        OR: [
                            { email: row.customerEmail },
                            { phone: row.customerPhone },
                        ],
                    },
                });

                if (!customer) {
                    customer = await prisma.customer.create({
                        data: {
                            firstName: row.customerFirstName,
                            lastName: row.customerLastName,
                            email: row.customerEmail,
                            phone: row.customerPhone,
                            address: row.deliveryAddress,
                        },
                    });
                }

                // Generar número de orden
                const lastOrder = await prisma.order.findFirst({
                    orderBy: { createdAt: 'desc' },
                    select: { orderNumber: true },
                });

                const lastNumber = lastOrder
                    ? parseInt(lastOrder.orderNumber.split('-')[1])
                    : 1000;
                const orderNumber = `ORD-${String(lastNumber + createdOrders.length + 1).padStart(5, '0')}`;

                const order = await prisma.order.create({
                    data: {
                        orderNumber,
                        customerId: customer.id,
                        deliveryAddress: row.deliveryAddress,
                        priority: row.priority || 'NORMAL',
                        scheduledDate: row.scheduledDate ? new Date(row.scheduledDate) : null,
                        totalAmount: parseFloat(row.totalAmount) || 0,
                        notes: row.notes,
                        createdById: req.user.userId,
                        items: {
                            create: [
                                {
                                    productName: row.productName,
                                    quantity: parseInt(row.quantity) || 1,
                                    unitPrice: parseFloat(row.unitPrice) || 0,
                                    totalPrice: parseFloat(row.totalAmount) || 0,
                                },
                            ],
                        },
                    },
                });

                createdOrders.push(order);
            } catch (error) {
                errors.push({
                    row: i + 2,
                    error: error.message,
                });
            }
        }

        res.json({
            message: `Importación completada: ${createdOrders.length} pedidos creados`,
            created: createdOrders.length,
            errors: errors.length,
            errorDetails: errors,
        });
    } catch (error) {
        console.error('Error en importación:', error);
        res.status(500).json({ error: 'Error al importar pedidos' });
    }
};

// Estadísticas de pedidos
export const getOrderStats = async (req, res) => {
    try {
        const [
            total,
            pending,
            inTransit,
            delivered,
            failed,
            todayOrders,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'IN_TRANSIT' } }),
            prisma.order.count({ where: { status: 'DELIVERED' } }),
            prisma.order.count({ where: { status: 'FAILED' } }),
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
        ]);

        res.json({
            total,
            byStatus: {
                pending,
                inTransit,
                delivered,
                failed,
            },
            todayOrders,
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
