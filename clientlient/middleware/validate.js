const Joi = require("joi");
const schemas = require("../middleware/schemas");

const validate = (schemaName, parseFlag) => (req, res, next) => {
  const schema = schemas[schemaName];
  // console.log(req.body);
  if (req.body.company) {
    console.log("Validating company:", req.body.company);
    const { error } = schema.validate(req.body.company, { abortEarly: false });
    if (error) {
      const errorMessages = error.details
        .map((err) => err.message.replace(/"/g, ""))
        .join(", ");

      return res.status(400).json({ error: errorMessages });
    }
  } else if (req.body.parent) {
    console.log("Validating parent:", req.body.parent);
    const { error } = schema.validate(req.body.parent, { abortEarly: false });
    if (error) {
      const errorMessages = error.details
        .map((err) => err.message.replace(/"/g, ""))
        .join(", ");

      return res.status(400).json({ error: errorMessages });
    }
  } else {
    let rawBody = req.body;
    
    if (parseFlag) {
      for (let i = 0; i < parseFlag.length; i++) {
        rawBody[parseFlag[i]] = JSON.parse(rawBody[parseFlag[i]])
      }
    }
    const { error } = schema.validate(rawBody, { abortEarly: false });

    if (error) {
      const errorMessages = error.details
        .map((err) => err.message.replace(/"/g, ""))
        .join(", ");

      return res.status(400).json({ error: errorMessages });
    }
  }

  next();
};

module.exports = validate;
