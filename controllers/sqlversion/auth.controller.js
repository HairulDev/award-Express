const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helper = require("#lib/response");
const authModel = require("#models/auth.model");
const genFuncModel = require("#models/genFunc.model");
const genFuncController = require("#controllers/genFunc.controller");
const secret = "test";
const { frontendUrl, roleIdUser, emailTesting } = require("#config/vars");
const authService = require("#services/auth.service");
const decode = require("jwt-decode");
const { string } = require("#utils/index");
const crypto = require("crypto");
const { generateRandomString } = require("#services/auth.service");

const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, password } = req.body;

    const oldUser = await authModel.signIn(email);

    if (!oldUser)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Login failed",
      });

    const isPasswordCorrect = await bcrypt.compare(oldPassword, oldUser.password);
    if (!isPasswordCorrect)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Old password wrong",
      });

    const hashedPassword = authService.generatePassword(password);

    await authModel.changePassword(email, {
      usr_password: hashedPassword,
      usr_timeupdated: new Date().toISOString(),
    });

    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Your password has changed, please sign in",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const mail = req.body.email;
    const selectTable = await genFuncController.tableSelect(1);
    const condition = { where: selectTable?.colsObj?.usr_email, value: mail };
    const selectUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    if (!selectUser) {
      throw new Error("USER_NOT_FOUND");
    }
    const timestamp = new Date().getTime().toString();
    const hash = crypto.createHash("md5").update(timestamp).digest("hex");
    const hashEmail = crypto.createHash("md5").update(mail).digest("hex");
    const code = hash + hashEmail + generateRandomString(5, true);

    const resetPasswordLink = `${frontendUrl}/newPassword/${code}`;
    let data = {
      name: selectUser.usr_name,
      resetPasswordLink: resetPasswordLink,
    };
    await genFuncController.sendEmail(selectUser.usr_email, emailTesting, 'Reset Password AVL', data, "recoverAccountProcess.hbs");

    const payload = {
      code,
      email: mail,
      timecreated: new Date().toISOString(),
    };
    await authModel.resetPassword(payload);

    return helper.successHelper(req, res, 200, { success: true, message: "Reset password link has been sent to your email" });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return helper.errorHelper(
        req,
        res,
        400,
        {
          status: "USER_NOT_FOUND",
          statusCode: 400,
          message: "User not found!",
          errors: "",
        },
        error
      );
    }
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const createNewPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const code = req.params.code;
    const userByToken = await authModel.getResetPasswordCode(code);

    if (string.isEmpty(userByToken)) {
      return helper.errorHelper(
        req,
        res,
        400,
        {
          statusCode: 400,
          message: "Your request rejected!",
          errors: "",
        },
      );
    }

    if (userByToken.is_expired || userByToken.is_used) {
      return helper.errorHelper(
        req,
        res,
        400,
        {
          statusCode: 400,
          message: "Your request has expired or has already been used!",
          errors: "",
        },
      );
    } else {
      const resetPasswordAge =
        Math.abs(new Date() - new Date(userByToken.timecreated)) / 86400000; // in days
      if (resetPasswordAge > 30) {
        const params = {
          is_expired: 1,
          timeupdated: new Date().toISOString(),
        };
        await authModel.updateResetPassword(code, params);
        return helper.errorHelper(
          req,
          res,
          400,
          {
            statusCode: 400,
            message: "Your request has been expired!",
            errors: "",
          },
        );
      }
    }

    const hashedPassword = authService.generatePassword(password);
    const user = await authModel.changePassword(userByToken.email, {
      usr_password: hashedPassword,
      usr_timeupdated: new Date().toISOString(),
    });

    await authModel.updateResetPassword(code, {
      is_used: 1,
      is_expired: 1,
      timeupdated: new Date().toISOString(),
    });

    let data = {
      name: user[0]?.usr_name,
      date: new Date().toLocaleString()
    };
    await genFuncController.sendEmail(userByToken.email, emailTesting, 'Create New Password AVL', data, "recoverAccountSuccess.hbs");


    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Your new password has created, please sign in again"
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const verifySignUp = async (params, token) => {
  const { to } = params;
  const verifyLink = `${frontendUrl}/authVerify/${token}`;
  let data = {
    params: params,
    verifyLink
  };
  await genFuncController.sendEmail(to, emailTesting, 'Verification Registration', data, "verifySignUp.hbs");
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const oldUser = await authModel.signIn(email);

    if (!oldUser)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Login failed",
      });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Your password wrong",
      });

    await genFuncModel.sessionChange("Active", email)

    const selectTable = await genFuncController.tableSelect(2);
    const condition = { where: selectTable?.colsObj?.usrh_email, value: email };
    const selectUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    let totalLogin = selectUser?.usrh_total_login;

    await authModel.signInHistory(
      {
        email: oldUser.email,
        signTotal: totalLogin + 1
      });

    const token = jwt.sign(
      {
        user_id: oldUser.user_id,
        email: oldUser.email,
        name: oldUser.name,
        type: oldUser.type,
        imageUrl: oldUser.file,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );
    const result = decode(token);
    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Login successfully",
      result,
      token,
    });
  } catch (error) {
    return helper.errorHelper(
      req,
      res,
      500,
      "You dont have Authorized networks",
      error
    );
  }
};

const signOut = async (req, res) => {
  const { email } = req.body;
  try {
    await genFuncModel.sessionChange("Destroy", email);

    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Your sign out successfully",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    if (string.isEmpty(email))
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: `Empty Email`,
      });

    const selectTable = await genFuncController.tableSelect(1);
    const condition = { where: selectTable?.colsObj?.usr_email, value: email };
    const selectUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    if (selectUser)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: `User already exists`,
      });

    const hashedPassword = await bcrypt.hash(password, 12);

    // aws
    const file = req.files.file;
    const path = "user"
    const uploadAws = await genFuncController.uploadAWS(file, path)
    // end aws

    let params = {
      roleIdUser,
      to: email,
      password: hashedPassword,
      firstName,
      lastName,
      file: uploadAws?.filenameFormatted,
    };
    await authModel.signUp(params);

    const userSignUp = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    const userToken = await authService.signToken(userSignUp, 30);
    await verifySignUp(params, userToken);

    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Registration successfully, check your email please",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const verifyReg = async (req, res) => {
  const token = decode(req.query.token);
  try {
    const selectTable = await genFuncController.tableSelect(1);
    const condition = { where: selectTable?.colsObj?.usr_email, value: token.usr_email };
    const selectUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    const emailUser = selectUser.usr_email;
    if (selectUser) await authModel.activeUser(emailUser);

    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Your verification successfull",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

module.exports = {
  changePassword,
  resetPassword,
  createNewPassword,
  verifySignUp,
  signin,
  signOut,
  signup,
  verifyReg,
};
