const { addProductSlider, getSliderProduct, getSingleSliderProduct, updateSliderProduct, deleteSliderProduct } = require("../Conrollers/Product/ProductHomeSlider")
const multer = require("multer")
const { authorize } = require("../utils/auth.utils")
const router = require("express").Router()
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "./uploads/product/slider")
    },
    filename(req, file, cb) {
        cb(null, `${new Date().getTime()}_${file.originalname}`)
    }
})
const upload = multer({ storage })
//add product to slider 
router.post("/create", authorize("admin"), upload.single("image"), addProductSlider)
router.get("/list", getSliderProduct)
router.get("/:id", getSingleSliderProduct)
router.put("/:id", authorize("admin"), upload.single("image"), updateSliderProduct)
router.delete("/:id", authorize("admin"), deleteSliderProduct)
module.exports = router