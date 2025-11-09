import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de base de datos...');

    // Limpiar datos existentes (opcional)
    await prisma.deliveryPhoto.deleteMany();
    await prisma.trackingLog.deleteMany();
    await prisma.routeOrder.deleteMany();
    await prisma.route.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.deliveryAgent.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.user.deleteMany();

    // USUARIOS
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@logiflow.com',
            password: hashedPassword,
            firstName: 'Carlos',
            lastName: 'Administrador',
            role: 'ADMIN',
        },
    });

    const operatorUser = await prisma.user.create({
        data: {
            email: 'operador@logiflow.com',
            password: hashedPassword,
            firstName: 'María',
            lastName: 'Operadora',
            role: 'OPERATOR',
        },
    });

    const agentUser1 = await prisma.user.create({
        data: {
            email: 'repartidor1@logiflow.com',
            password: hashedPassword,
            firstName: 'Juan',
            lastName: 'Pérez',
            role: 'DELIVERY_AGENT',
        },
    });

    const agentUser2 = await prisma.user.create({
        data: {
            email: 'repartidor2@logiflow.com',
            password: hashedPassword,
            firstName: 'Ana',
            lastName: 'García',
            role: 'DELIVERY_AGENT',
        },
    });

    console.log('✅ Usuarios creados');

    // REPARTIDORES
    const agent1 = await prisma.deliveryAgent.create({
        data: {
            userId: agentUser1.id,
            phone: '+54 9 221 555-1234',
            vehicleType: 'MOTORCYCLE',
            licensePlate: 'AB123CD',
            rating: 4.8,
            totalDeliveries: 245,
        },
    });

    const agent2 = await prisma.deliveryAgent.create({
        data: {
            userId: agentUser2.id,
            phone: '+54 9 221 555-5678',
            vehicleType: 'BIKE',
            rating: 4.9,
            totalDeliveries: 189,
        },
    });

    console.log('✅ Repartidores creados');

    // ZONAS
    const zone1 = await prisma.zone.create({
        data: {
            name: 'Zona Centro',
            description: 'Centro de La Plata',
            color: '#3B82F6',
        },
    });

    const zone2 = await prisma.zone.create({
        data: {
            name: 'Zona Norte',
            description: 'City Bell y alrededores',
            color: '#10B981',
        },
    });

    const zone3 = await prisma.zone.create({
        data: {
            name: 'Zona Sur',
            description: 'Villa Elisa, Bernal',
            color: '#F59E0B',
        },
    });

    console.log('✅ Zonas creadas');

    // CLIENTES
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                firstName: 'Roberto',
                lastName: 'Martínez',
                email: 'roberto.martinez@email.com',
                phone: '+54 9 221 400-1111',
                address: 'Calle 7 N° 845, La Plata',
                latitude: -34.9205,
                longitude: -57.9536,
                zoneId: zone1.id,
            },
        }),
        prisma.customer.create({
            data: {
                firstName: 'Laura',
                lastName: 'Fernández',
                email: 'laura.fernandez@email.com',
                phone: '+54 9 221 400-2222',
                address: 'Av. Cantilo 1250, City Bell',
                latitude: -34.8706,
                longitude: -58.0456,
                zoneId: zone2.id,
            },
        }),
        prisma.customer.create({
            data: {
                firstName: 'Diego',
                lastName: 'Rodríguez',
                email: 'diego.rodriguez@email.com',
                phone: '+54 9 221 400-3333',
                address: 'Calle 50 N° 1234, La Plata',
                latitude: -34.9214,
                longitude: -57.9544,
                zoneId: zone1.id,
            },
        }),
        prisma.customer.create({
            data: {
                firstName: 'Sofía',
                lastName: 'López',
                phone: '+54 9 221 400-4444',
                address: 'Camino Centenario Km 18, Villa Elisa',
                latitude: -34.8523,
                longitude: -58.0892,
                zoneId: zone3.id,
            },
        }),
        prisma.customer.create({
            data: {
                firstName: 'Martín',
                lastName: 'González',
                email: 'martin.gonzalez@email.com',
                phone: '+54 9 221 400-5555',
                address: 'Calle 13 N° 567, La Plata',
                latitude: -34.9187,
                longitude: -57.9489,
                zoneId: zone1.id,
            },
        }),
    ]);

    console.log('✅ Clientes creados');

    // PEDIDOS
    const orders = [];
    for (let i = 0; i < 15; i++) {
        const customer = customers[i % customers.length];
        const statuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];
        const priorities = ['NORMAL', 'HIGH', 'URGENT'];

        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${String(1000 + i).padStart(5, '0')}`,
                customerId: customer.id,
                deliveryAddress: customer.address,
                deliveryLat: customer.latitude,
                deliveryLng: customer.longitude,
                zoneId: customer.zoneId,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                scheduledTimeSlot: ['09:00-12:00', '12:00-15:00', '15:00-18:00'][Math.floor(Math.random() * 3)],
                totalAmount: 0,
                notes: i % 3 === 0 ? 'Llamar antes de llegar' : null,
                createdById: operatorUser.id,
            },
        });

        // Items del pedido
        const itemsCount = Math.floor(Math.random() * 3) + 1;
        let orderTotal = 0;

        for (let j = 0; j < itemsCount; j++) {
            const products = [
                { name: 'Notebook Lenovo', price: 85000 },
                { name: 'Mouse Logitech', price: 12000 },
                { name: 'Teclado Mecánico', price: 25000 },
                { name: 'Monitor Samsung 24"', price: 120000 },
                { name: 'Auriculares Bluetooth', price: 18000 },
            ];
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const total = product.price * quantity;
            orderTotal += total;

            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productName: product.name,
                    quantity,
                    unitPrice: product.price,
                    totalPrice: total,
                },
            });
        }

        // Actualizar total del pedido
        await prisma.order.update({
            where: { id: order.id },
            data: { totalAmount: orderTotal },
        });

        orders.push(order);
    }

    console.log('✅ Pedidos creados');

    // RUTAS
    const route1 = await prisma.route.create({
        data: {
            routeName: 'Ruta Centro - Mañana',
            deliveryAgentId: agent1.id,
            routeDate: new Date(),
            status: 'IN_PROGRESS',
            totalDistance: 12.5,
            estimatedTime: 90,
        },
    });

    // Asignar algunos pedidos a la ruta
    for (let i = 0; i < 5; i++) {
        if (orders[i]) {
            await prisma.routeOrder.create({
                data: {
                    routeId: route1.id,
                    orderId: orders[i].id,
                    sequence: i + 1,
                    status: i < 2 ? 'DELIVERED' : 'IN_TRANSIT',
                },
            });
        }
    }

    console.log('✅ Rutas creadas');

    // TRACKING LOGS
    await prisma.trackingLog.createMany({
        data: [
            {
                deliveryAgentId: agent1.id,
                orderId: orders[2]?.id,
                latitude: -34.9205,
                longitude: -57.9536,
                status: 'moving',
                speed: 25.5,
            },
            {
                deliveryAgentId: agent2.id,
                latitude: -34.8706,
                longitude: -58.0456,
                status: 'stopped',
                speed: 0,
            },
        ],
    });

    console.log('✅ Tracking logs creados');

    console.log('');
    console.log('🎉 Seed completado exitosamente!');
    console.log('');
    console.log('📧 Usuarios de prueba:');
    console.log('   Admin: admin@logiflow.com / admin123');
    console.log('   Operador: operador@logiflow.com / admin123');
    console.log('   Repartidor 1: repartidor1@logiflow.com / admin123');
    console.log('   Repartidor 2: repartidor2@logiflow.com / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error en el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
