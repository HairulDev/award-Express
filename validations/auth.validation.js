const Joi = require("joi");

const login = {
  body: Joi.object().keys({
    username: Joi.string().required().label("Username"),
    password: Joi.string().required().label("Password"),
  }),
};

const verify = {
  body: Joi.object().keys({
    grant_type: Joi.string()
      .valid(
        "code",
        "azure_token",
        "azure_adb2c_token",
        "token",
        "refresh_token"
      )
      .label("Grant Type"),
    code: Joi.alternatives().conditional("grant_type", {
      is: "code",
      then: Joi.string().required(),
    }),
    azure_token: Joi.alternatives().conditional("grant_type", {
      is: "azure_token",
      then: Joi.string().required(),
    }),
    azure_adb2c_token: Joi.alternatives().conditional("grant_type", {
      is: "azure_adb2c_token",
      then: Joi.string().required(),
    }),
    token: Joi.alternatives().conditional("grant_type", {
      is: "token",
      then: Joi.string().required(),
    }),
    refresh_token: Joi.alternatives().conditional("grant_type", {
      is: "refresh_token",
      then: Joi.string().required(),
    }),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().required().label("Email"),
  }),
};

const checkCode = {
  params: Joi.object().keys({
    code: Joi.string().required().label("Code"),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    email: Joi.string().required().label("Email"),
    code: Joi.string().required().label("Code"),
    password: Joi.string().required().label("Password"),
  }),
};

const changePasswordAuthenticated = {
  body: Joi.object().keys({
    password: Joi.string().required().label("Password"),
    oldPassword: Joi.string().required().label("Old Password"),
  }),
};

const claimTokenIP = {
  body: Joi.object().keys({
    email: Joi.string().required().label("Email"),
  }),
};

module.exports = {
  claimTokenIP,
  login,
  verify,
  resetPassword,
  changePassword,
  checkCode,
  changePasswordAuthenticated,
};
