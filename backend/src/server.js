import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/prisma.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await prisma.$connect();

        logger.info('Connected to database');

        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error({
            message: 'Database connection failed',
            error: error.message,
        });
        process.exit(1);
    }
};

startServer();
