const { addTag, getTags, deletetags, deleteSelectedtags, updateTags, getTagsByCategory } = require("../Conrollers/Tags/Tags.controller")
const { authorize } = require("../utils/auth.utils")

const router = require("express").Router()

//add new tag

router.get("/list/data", authorize("admin", "sellar"), getTags)
router.get("/list/:id", authorize("admin", "sellar"), getTagsByCategory)
router.post("/delete/selected", authorize("admin"), deleteSelectedtags)
router.post("/create", authorize("admin"), addTag)
router.delete("/:id", authorize("admin"), deletetags)
router.put("/:id", authorize("admin"), updateTags)

module.exports = router