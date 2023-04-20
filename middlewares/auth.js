const jwt = require("jsonwebtoken");
const { secretKey } = require("#config/vars");

/**
 * Verify JWT token
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "ERROR",
          statusCode: 401,
          message: "Authentication token is not valid.",
          errors: [err.message],
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      status: "ERROR",
      statusCode: 401,
      message: "Authentication token is not supplied.",
      errors: [],
    });
  }
};

/**
 * Verify JWT token
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const verifyApiKey = (req, res, next) => {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(401).json({
        status: "ERROR",
        statusCode: 401,
        message: "API Key is not supplied.",
        errors: [],
      });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "ERROR",
          statusCode: 401,
          message: "API Key is not valid.",
          errors: [err.message],
        });
      } else {
        next();
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  verifyToken,
  verifyApiKey,
};
