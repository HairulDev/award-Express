const express = require("express");
const router = express.Router();

const authController = require("#controllers/auth.controller");

router.post("/auth/signin", authController.signin);
router.post("/auth/signup", authController.signup);
router.get("/auth/verifyReg?:token", authController.verifyReg);
module.exports = router;
