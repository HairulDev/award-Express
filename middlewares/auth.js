var jwt = require("jsonwebtoken");
const { secretKey, tokenGithub } = require("#config/vars");

const secret = "test";


const authGithub = async (req, res, next) => {
  try {
    req.headers.Authorization = `Token ${tokenGithub}`;
    next();
  } catch (error) {
    console.log(error);
  }
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, secret);

      req.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);

      req.userId = decodedData?.sub;
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = auth;

const isLogin = (req, res, next) => {
  if (req.session.user == null || req.session.user == undefined) {
    req.flash("alertMessage", "Session telah habis silahkan signin kembali!!");
    req.flash("alertStatus", "danger");
    res.redirect("/admin/signin");
  } else {
    next();
  }
};

module.exports = isLogin;

/** PROLINE
 * Verify JWT token
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

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
  auth,
  authGithub,
};
