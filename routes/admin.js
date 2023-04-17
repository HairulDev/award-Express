const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
// const auth = require("../middlewares/auth");

// router.use(auth);
router.get("/dashboard", adminController.viewDashboard);
// endpoint category
router.get("/category", adminController.viewCategory);
router.get("/categoryById/:id", adminController.viewCategoryById);
router.post("/category", adminController.addCategory);
router.put("/category", adminController.editCategory);
router.delete("/category/:id", adminController.deleteCategory);
// endpoint account
router.get("/account", adminController.viewAccount);
router.get("/account/:id", adminController.viewAccountById);
router.post("/account", adminController.addAccount);
router.put("/account", adminController.editAccount);
router.delete("/account/:id", adminController.deleteAccount);
// endpoint item
router.get("/item", adminController.viewItem);
router.get("/itemById/:id", adminController.viewItemById);
router.post("/item", adminController.addItem);
router.get("/item/show-image/:id", adminController.showImageItem);
router.get("/item/:id", adminController.showEditItem);
router.put("/item/:id", adminController.editItem);
router.put('/item/:id/likeItem', adminController.likeItem);
router.post('/item/:id/commentItem', adminController.commentItem);
router.delete("/item/:id/delete", adminController.deleteItem);
// endpoint detail item
router.get("/item/show-detail-item/:itemId", adminController.viewDetailItem);
router.post("/item/add/feature", adminController.addFeature);
router.get("/item/showEditFeature/:id", adminController.showEditFeature);
router.put("/item/update/feature", adminController.editFeature);
router.delete("/item/:itemId/feature/:id", adminController.deleteFeature);
// endpoint feature
router.post("/item/add/activity", adminController.addActivity);
router.get("/item/showEditActivity/:id", adminController.showEditActivity);
router.put("/item/update/activity", adminController.editActivity);
router.delete("/item/:itemId/activity/:id", adminController.deleteActivity);
// endpoint booking
router.get("/booking", adminController.viewBooking);
router.get("/booking/search", adminController.viewBookingBySearch);
router.get("/purchase", adminController.viewPurchase);
router.get("/booking/:id", adminController.showDetailBooking);
router.put("/booking/:id/confirmation", adminController.actionConfirmation);
router.put("/booking/:id/reject", adminController.actionReject);

module.exports = router;
