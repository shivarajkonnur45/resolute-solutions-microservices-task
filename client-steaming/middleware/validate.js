const Joi = require('joi');
const schemas = require('../middleware/schemas');

const validate = (schemaName) => (req, res, next) => {
    const schema = schemas[schemaName];
    const { error } = schema.validate(req.body);

    if (error) {
        const details = error.details.map((err) => err.message);
        return res.status(400).json({ error: details.join(', ') });
    }

    next();
};

module.exports = validate;
