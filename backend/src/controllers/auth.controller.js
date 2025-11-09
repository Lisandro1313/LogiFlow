import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

// Registro de usuario
export const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'OPERATOR',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        // Generar token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user,
            token,
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                deliveryAgent: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.isActive) {
            return res.status(401).json({ error: 'Usuario inactivo' });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                agentId: user.deliveryAgent?.id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // No enviar contraseña
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login exitoso',
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Obtener perfil actual
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
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
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Adaptar respuesta para compatibilidad con frontend
        const response = {
            ...user,
            name: `${user.firstName} ${user.lastName}`, // Agregar campo 'name' para frontend
        };

        res.json(response);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

// Actualizar perfil
export const updateProfile = async (req, res) => {
    try {
        let { firstName, lastName, name, phone, address } = req.body;

        // Si viene 'name', dividir en firstName y lastName
        if (name && !firstName && !lastName) {
            const nameParts = name.trim().split(' ');
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ') || nameParts[0];
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;

        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                updatedAt: true,
            },
        });

        // Respuesta adaptada para frontend
        const response = {
            ...user,
            name: `${user.firstName} ${user.lastName}`,
        };

        res.json({
            message: 'Perfil actualizado',
            user: response,
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error al actualizar perfil' });
    }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
};
