const express = require("express");
const router = express.Router();

const nasaController = require("#controllers/nasa.controller");

router.get("/nasa", nasaController.nasaDashboard);
module.exports = router;
