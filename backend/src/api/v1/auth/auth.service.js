import bcrypt from 'bcryptjs';

import prisma from '../../../config/prisma.js';
import logger from '../../../utils/logger.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../../../utils/jwt.js';

const sanitizeUser = (user) => {
    const { password, ...sanitized } = user;
    return sanitized;
};

export const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.status = 401;
        throw error;
    }

    const payload = {
        userId: user.id,
        role: user.role,
    };

    return {
        user: sanitizeUser(user),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

export const refreshAuthTokens = async (refreshToken) => {
    try {
        const payload = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            const refreshError = new Error('User not found');
            refreshError.status = 404;
            throw refreshError;
        }

        return {
            accessToken: generateAccessToken({
                userId: user.id,
                role: user.role,
            }),
            refreshToken: generateRefreshToken({
                userId: user.id,
                role: user.role,
            }),
            user: sanitizeUser(user),
        };
    } catch (error) {
        logger.error({
            message: 'Refresh token verification failed',
            error: error.message,
        });

        const refreshError = new Error('Invalid refresh token');
        refreshError.status = 401;
        throw refreshError;
    }
};

export const logoutUser = async () => {
    return { success: true };
};

export const registerUser = async (registerData) => {
    const {
        email,
        password,
        name,
        phone,
        role,
        businessName,
        address,
        location,
        expertise,
    } = registerData;

    // Condition to check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const error = new Error('User already exists with this email');
        error.status = 400;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
    };

    // Add agent-specific fields if role is agent
    if (role === 'agent') {
        userData.businessName = businessName;
        userData.address = address;
        userData.location = location;
        userData.expertise = expertise;
    }

    const user = await prisma.user.create({
        data: userData,
    });

    logger.info({
        message: 'User registered successfully',
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    const payload = {
        userId: user.id,
        role: user.role,
    };

    return {
        user: sanitizeUser(user),
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
