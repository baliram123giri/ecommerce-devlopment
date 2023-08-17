
const mongoose = require("mongoose")

const ProductHomeSliderImageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    pathname: {
        type: String,
        required: true
    }
})
const ProductHomeSliderSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId, ref: "Category",
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId, ref: "subCategory",
        required: true
    },
    image: { type: mongoose.Schema.Types.ObjectId, ref: "productHomeSliderImage", required: true }
})

const ProductHomeSliderImageModel = mongoose.model("productHomeSliderImage", ProductHomeSliderImageSchema)
const ProductHomeSliderSchemaModel = mongoose.model("productHomeSlider", ProductHomeSliderSchema)

module.exports = { ProductHomeSliderImageModel, ProductHomeSliderSchemaModel }