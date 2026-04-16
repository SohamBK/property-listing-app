import pkg from '@prisma/client';
import logger from '../utils/logger.js';

const { PrismaClient } = pkg;

const globalForPrisma = globalThis;

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    logger.info({
        message: 'DB Query',
        model: params.model,
        action: params.action,
        duration: `${duration}ms`,
    });

    return result;
});

export default prisma;
