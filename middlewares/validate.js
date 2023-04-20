const Joi = require("joi");
const pick = require("#utils/pick");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({
      errors: { label: "key" },
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) =>
      details.message.replace(/"/g, "")
    );

    // TODO: Create middleware for error response
    return res.status(400).send({
      status: "ERROR",
      statusCode: 400,
      message: "Request failed due to input contraints",
      errors: errorMessage,
    });
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
