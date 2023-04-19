const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
router.get("/account/:id", adminController.viewAccountById);
router.delete("/account/:id", adminController.deleteAccount);
router.get("/category", adminController.viewCategory);
router.get("/categoryById/:id", adminController.viewCategoryById);
router.post("/category", adminController.addCategory);
router.put("/category", adminController.editCategory);
router.delete("/category/:id", adminController.deleteCategory);
router.get("/getItemBySearch", adminController.getItemBySearch);
router.get("/item", adminController.viewItem);
router.get("/itemById/:id", adminController.viewItemById);
router.post("/item", adminController.addItem);
router.get("/item/show-image/:id", adminController.showImageItem);
router.get("/item/:id", adminController.showEditItem);
router.put("/item/:id", adminController.editItem);
router.delete("/item/:id/delete", adminController.deleteItem);

module.exports = router;
