const router = require("express").Router();
const apiController = require("../controllers/apiController");

router.get("/landing-page", apiController.landingPage);
router.get("/landing-page/search", apiController.landingPageBySearch);
router.get("/detail-page/:id", apiController.detailPage);
router.post("/booking-page", apiController.bookingPage);
module.exports = router;
