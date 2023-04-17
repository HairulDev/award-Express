const attachmentValidation = require("./attachment.validation");
const clockValidation = require("./clock.validation");
const notificationValidation = require("./notification.validation");
const userDeviceValidation = require("./userDevice.validation");
const authValidation = require("./auth.validation");
const sheValidation = require("./she.validation");
const vendorRegistrationValidation = require("./vendorRegistration.validation");
const setupTenderValidation = require("./setupTenderValidation.validation");

module.exports = {
  attachmentValidation,
  clockValidation,
  notificationValidation,
  userDeviceValidation,
  authValidation,
  sheValidation,
  vendorRegistrationValidation,
  setupTenderValidation,
};
