import winston from 'winston';

const { combine, timestamp, printf, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'property-api' },
    transports: [
        new winston.transports.Console({
            format: combine(timestamp(), logFormat),
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

export default logger;
