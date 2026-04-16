import logger from '../utils/logger.js';
import { errorResponse } from '../utils/response.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            const error = new Error('Authentication required');
            error.status = 401;
            throw error;
        }

        const payload = verifyAccessToken(token);
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        logger.info({
            message: 'User authenticated',
            userId: payload.userId,
            role: payload.role,
        });

        return next();
    } catch (error) {
        let message = 'Invalid token';
        let status = 401;

        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token';
        } else if (error.message === 'Authentication required') {
            message = error.message;
        }

        logger.warn({
            message: 'Authentication failed',
            error: error.message,
            route: req.originalUrl,
        });

        return errorResponse(res, message, status);
    }
};

export const optionalAuthenticate = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (token) {
            const payload = verifyAccessToken(token);
            req.user = {
                userId: payload.userId,
                role: payload.role,
            };

            logger.info({
                message: 'User optionally authenticated',
                userId: payload.userId,
                role: payload.role,
            });
        }

        return next();
    } catch (error) {
        logger.debug({
            message: 'Optional authentication failed, continuing without user',
            error: error.message,
            route: req.originalUrl,
        });

        return next();
    }
};

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                const error = new Error('User not authenticated');
                error.status = 401;
                throw error;
            }

            if (!allowedRoles.includes(req.user.role)) {
                logger.warn({
                    message: 'Authorization failed - role mismatch',
                    userId: req.user.userId,
                    userRole: req.user.role,
                    allowedRoles,
                    route: req.originalUrl,
                });

                const error = new Error('Access denied');
                error.status = 403;
                throw error;
            }

            logger.info({
                message: 'User authorized',
                userId: req.user.userId,
                role: req.user.role,
                allowedRoles,
            });

            return next();
        } catch (error) {
            return errorResponse(
                res,
                error.message || 'Access denied',
                error.status || 403
            );
        }
    };
};
