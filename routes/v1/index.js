const express = require("express");
const router = express.Router();

const authRouter = require("./auth.route");
const dashboardRouter = require("./dashboard.route");
const nasaRouter = require("./nasa.route");
const messageRouter = require("./message.route");


router.use("/", authRouter);
router.use("/", dashboardRouter);
router.use("/", nasaRouter);
router.use("/", messageRouter);

module.exports = router;
