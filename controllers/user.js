const { errorHelper, successHelper } = require("#lib/response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModal = require("../models/user");
const { uploadFile } = require("./genFunc.controller");

const secret = 'test';

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });
    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    return successHelper(req, res, 200, {
      success: true,
      result: oldUser,
      token
    });
  } catch (err) {
    return errorHelper(req, res, 500, {
      success: false,
      message: `Something went wrong`,
    });
  }
};

const signup = async (req, res) => {
  const body = req.body;
  const { email, password, firstName, lastName, } = body;
  const file = req.files.file;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const pathFile = "public/images/users"
    const uploading = await uploadFile(file, pathFile, req, res)

    const result = await UserModal.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      file: uploading?.filenameFormatted,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });

    res.status(201).json({ result, token, data: uploading.data });
  } catch (error) {
    console.log("error ======", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  signin,
  signup,
};