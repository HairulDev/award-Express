const Joi = require("joi");

const itemValidation = {
  body: Joi.object().keys({
    name: Joi.string().required().label("Category Name"),
  }),
};

module.exports = {
  itemValidation,
};
