const Joi = require('joi');
const schemas = require('../middleware/schemas');

const validate = (schemaName) => (req, res, next) => {
    const schema = schemas[schemaName];
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details
            .map((err) => err.message.replace(/"/g, ''))
            .join(', ');

        return res.status(400).json({ message: errorMessages });
    }

    next();
};

module.exports = validate;
