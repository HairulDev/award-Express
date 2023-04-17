const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helper = require("#lib/response");
const UserModal = require("../models/user");
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
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Email address not exists",
      });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    console.log("isPasswordCorrect =====>", isPasswordCorrect);

    if (!isPasswordCorrect)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Your password wrong",
      });

    // await genFuncModel.sessionChange("Active", email)

    // const selectTable = await genFuncController.tableSelect(2);
    // const condition = { where: selectTable?.colsObj?.usrh_email, value: email };
    // const selectUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);

    // let totalLogin = selectUser?.usrh_total_login;

    // await authModel.signInHistory(
    //   {
    //     email: oldUser.email,
    //     signTotal: totalLogin + 1
    //   });

    const token = jwt.sign({ email: oldUser.email, name: oldUser.name, id: oldUser._id }, secret, { expiresIn: "1h" });
    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Login successfully",
      result: oldUser,
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
    // await genFuncModel.sessionChange("Destroy", email);

    return helper.successHelper(req, res, 200, {
      success: true,
      message: "Your sign out successfully",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

const signup = async (req, res) => {
  const body = req.body;

  const { email, password, firstName, lastName, coordinatUser } = body;
  const file = req.files.file;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const pathFile = "public/images/users"
    const uploading = await genFuncController.uploadFile(file, pathFile, req, res)

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      coordinatUser,
      file: uploading?.filenameFormatted,
    });


    let params = {
      to: email,
      password: hashedPassword,
      firstName,
      lastName,
      file: uploading?.filenameFormatted,
    };

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });

    await verifySignUp(params, token);

    res.status(201).json({ result, token, data: uploading.data });
  } catch (error) {
    console.log("error ======", error);
    res.status(500).json({ message: "Something went wrong" });
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
