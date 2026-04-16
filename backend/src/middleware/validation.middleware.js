const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source] || {};

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: error.details.map((err) => err.message),
            });
        }

        req[source] = value;
        next();
    };
};

export default validate;
