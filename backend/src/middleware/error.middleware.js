import { errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

const errorMiddleware = (err, req, res, next) => {
    logger.error(err);

    return errorResponse(res, err.message, err.status || 500);
};

export default errorMiddleware;
