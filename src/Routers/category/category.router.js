const router = require("express").Router()
const { createCategory, getAllCategories, updateCategory, deleteCategory, addMoreSubCategory, deleteMultiCategories, getOnlyCategories, getOnlySubcategories } = require("../../Conrollers/Category/Category.conrollers");
const { authorize } = require('../../utils/auth.utils');

router.post("/create", authorize("admin"), createCategory)
router.post("/selected/delete", authorize("admin"), deleteMultiCategories)
router.delete("/:id", authorize("admin"), deleteCategory)
router.get("/list", authorize("admin", "sellar"), getAllCategories)
router.get("/categories/list", authorize("admin", "sellar"), getOnlyCategories)
router.get("/subcategories/list/:id", authorize("admin", "sellar"), getOnlySubcategories)
router.put("/addmore/:id", authorize("admin"), addMoreSubCategory)
router.put("/:id/:categoryId", authorize("admin"), updateCategory)

module.exports = router