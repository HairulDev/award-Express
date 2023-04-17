const Joi = require("joi");

const getUser = {
  params: {
    usr_id: Joi.number().required().label("User ID is required"),
  },
};

const updateUser = {
  usr_email: Joi.string(),
  usr_name: Joi.string(),
  usr_phone: Joi.string(),
  usr_referenceemail: Joi.string(),
  usr_password: Joi.string(),
  usr_companyid: Joi.string().allow(null),
  usr_company: Joi.string().allow(null),
  usr_vdoid: Joi.string().allow(null),
  usr_type: Joi.string(),
  usr_activation: Joi.string(),
  roles: Joi.array().min(1),
};

const createUser = {
  usr_email: Joi.string(),
  usr_name: Joi.string(),
  usr_phone: Joi.string(),
  usr_referenceemail: Joi.string(),
  usr_password: Joi.string().required().min(8),
  usr_companyid: Joi.string().allow(null),
  usr_company: Joi.string().allow(null),
  usr_vdoid: Joi.string().allow(null),
  usr_type: Joi.string().allow(null),
  usr_activation: Joi.string(),
  roles: Joi.array().min(1),
};

module.exports = {
  getUser,
  createUser,
  updateUser,
};
