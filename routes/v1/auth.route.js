const express = require("express");
const router = express.Router();

const authController = require("#controllers/auth.controller");

router.post("/auth/signin", authController.signin);
router.post("/auth/signOut", authController.signOut);
router.post("/auth/signup", authController.signup);
router.get("/auth/verifyReg?:token", authController.verifyReg);
router.post("/auth/resetPassword", authController.resetPassword);
router.post(
    "/auth/changePassword",
    authController.changePassword
);

router.post(
    "/auth/createNewPassword/:code",
    authController.createNewPassword
);
module.exports = router;
