const parseFormData = (req, res, next) => {
    try {
        if (req.body.configurations) {
            req.body.configurations = JSON.parse(req.body.configurations);
        }

        if (req.body.mediaMeta) {
            req.body.mediaMeta = JSON.parse(req.body.mediaMeta);
        }

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON format in form data',
        });
    }
};

export default parseFormData;
