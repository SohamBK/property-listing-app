import logger from '../utils/logger.js';

const loggerMiddleware = (req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        body: req.body,
    });

    next();
};

export default loggerMiddleware;
