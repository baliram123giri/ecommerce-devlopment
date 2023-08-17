const { addProduct, getProducts, getShortDataAllProducts, deleteProduct, updateProduct, productFilterList } = require("../Conrollers/Product/Product.controller");
const router = require("express").Router();
const multer = require("multer");
const { authorize, normalAuth } = require("../utils/auth.utils");

let productDetailDescriptionImages = "./uploads/product/description"
let productImages = "./uploads/product/images"
let productThumbnail = "./uploads/product/thumbnails"

//setup the storage engine fr multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "./uploads";
    if (file.fieldname === "productThumbnail") {
      dest = productThumbnail
    } else if (file.fieldname === "images") {
      dest = productImages
    } else if (file.fieldname === "productDetailDescriptionImages") {
      dest = productDetailDescriptionImages
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, `${new Date().getTime()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
const uploadFields = [
  { name: "productThumbnail", maxCount: 1 },
  { name: "images" },
  { name: "productDetailDescriptionImages" },
]

router.post(
  "/create",
  authorize("sellar"),
  upload.fields(uploadFields),
  addProduct
);


router.get("/list", normalAuth(), getShortDataAllProducts)
router.get("/filterlist/subcategory/:id", normalAuth(), productFilterList)
router.get("/:id", normalAuth(), getProducts)
router.delete("/delete/:id", authorize("sellar"), deleteProduct)
router.put("/:id", authorize("sellar"), upload.fields(uploadFields), updateProduct)
module.exports = router;
