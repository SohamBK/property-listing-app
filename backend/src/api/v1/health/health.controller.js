import logger from '../../../utils/logger.js';
import { successResponse } from '../../../utils/response.js';

export const healthCheck = async (req, res, next) => {
    try {
        logger.info('Health check endpoint called');

        const healthData = {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };

        return successResponse(res, healthData, 'Server is healthy');
    } catch (error) {
        logger.error({
            message: 'Health check failed',
            error: error.message,
            stack: error.stack,
        });
        next(error);
    }
};

export const protectedHealthCheck = async (req, res, next) => {
    try {
        logger.info({
            message: 'Protected health check called',
            userId: req.user.userId,
            role: req.user.role,
        });

        const healthData = {
            status: 'OK',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            user: {
                userId: req.user.userId,
                role: req.user.role,
            },
        };

        return successResponse(
            res,
            healthData,
            'Server is healthy - authenticated'
        );
    } catch (error) {
        logger.error({
            message: 'Protected health check failed',
            error: error.message,
            stack: error.stack,
        });
        next(error);
    }
};
