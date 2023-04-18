var jwt = require("jsonwebtoken");
const { tokenGithub } = require("#config/vars");


const authGithub = async (req, res, next) => {
  try {
    req.headers.Authorization = `Token ${tokenGithub}`;
    next();
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  authGithub,
};
