const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helper = require("#lib/response");
const UserModal = require("../models/user");
const genFuncController = require("#controllers/genFunc.controller");
const secret = "test";
const { frontendUrl, roleIdUser, emailTesting } = require("#config/vars");
const decode = require("jwt-decode");

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

    if (!isPasswordCorrect)
      return helper.errorHelper(req, res, 400, {
        statusCode: 400,
        success: false,
        message: "Your password wrong",
      });

    const token = jwt.sign({
      email: oldUser.email,
      name: oldUser.name,
      id: oldUser._id
    },
      secret, { expiresIn: "1h" });
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

  const { email, password, firstName, lastName, } = body;
  const file = req?.files?.file;

  try {

    if (!file) return res.status(400).json({ message: "Choose your image profile" });

    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const pathFile = "public/images/users"
    const uploading = await genFuncController.uploadFile(file, pathFile, req, res)

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      file: uploading?.filenameFormatted,
    });


    let params = {
      to: email,
      password: hashedPassword,
      firstName,
      lastName,
      file: uploading?.filenameFormatted,
    };

    const token = jwt.sign({
      email: result.email,
      id: result._id
    }, secret, { expiresIn: "1h" });

    await verifySignUp(params, token);

    res.status(201).json({
      result, token, data: uploading.data,
      message: "You have registered successfully",
    });
  } catch (error) {
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
      message: "Your verification successfully",
    });
  } catch (error) {
    return helper.errorHelper(req, res, 500, undefined, error);
  }
};

module.exports = {
  verifySignUp,
  signin,
  signOut,
  signup,
  verifyReg,
};