// Response utility functions for consistent API responses

export const successResponse = (res, data = null, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (
    res,
    message = 'Something went wrong',
    status = 500
) => {
    return res.status(status).json({
        success: false,
        message,
    });
};

export const paginatedResponse = (
    res,
    data,
    page,
    limit,
    total,
    message = 'Success'
) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};
