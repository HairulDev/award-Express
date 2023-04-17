const jwt = require("jsonwebtoken");
const { secretKey } = require("#config/vars");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

/**
 * Generate JWT token
 *
 * @param {object} params - Object data of {lan_id, sap_id, emp_id, email, name}
 * @return {String} token
 */

const signToken = (params, dayExpired = 1) => {
  const { usr_id, usr_email, usr_name } = params;
  const token = jwt.sign(
    {
      usr_id,
      usr_email,
      usr_name,
    },
    secretKey,
    {
      expiresIn: dayExpired * 86400,
    }
  );
  return token;
};

const checkPassword = (password, passwordDb) => {
  return bcrypt.compareSync(password, passwordDb);
};

const generatePassword = (password) => {
  try {
    return bcrypt.hashSync(password, 10);
  } catch (error) {
    return error;
  }
};

const generateRandomString = (length = 8, withoutSymbol = false) => {
  let chars =
    "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789!@#$*";
  if (withoutSymbol) {
    chars = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
  }

  let randomPassword = "";
  for (var i = 0; i < length; i++) {
    index = Math.floor(Math.random() * chars.length);
    randomPassword += chars.charAt(index);
  }
  return randomPassword;
};

module.exports = {
  signToken,
  checkPassword,
  generatePassword,
  generateRandomString,
};
