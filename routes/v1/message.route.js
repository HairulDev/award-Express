const express = require("express");
const router = express.Router();

const nasaController = require("#controllers/message.controller");

router.post("/messages", nasaController.sendMessage);
router.get("/messages/:id", nasaController.getMessage);
router.get("/messages", nasaController.getMessages);
module.exports = router;
