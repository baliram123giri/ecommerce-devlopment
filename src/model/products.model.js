const mongoose = require("mongoose")

const ProductImgesSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    pathname: {
        type: String,
        required: true
    }
}, { timestamps: true })

const poroduthumbnailSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    pathname: {
        type: String,
        required: true
    }
})

const producDetailsImagesSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    pathname: {
        type: String,
        required: true
    }
})
const ProductSChema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    handlingFees: {
        type: Number,
        default: 0
    },
    discountedPrice: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productThumbnail: {
        type: mongoose.Schema.Types.ObjectId, ref: "ProductThumbnail"
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId, ref: "subCategory",
        required: true
    },
    isPublish: {
        type: Boolean
    },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductImage" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", required: true }],

    productDetails: {
        description: {
            images: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductDescriptionImage" }],
            content: { type: String }
        },
        specifications: [{
            name: {
                type: String
            },
            value: {
                type: String
            }
        }],
        moreInfo: {
            type: String
        }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }

})

const ProductModel = mongoose.model("Product", ProductSChema)
const ProductImageModel = mongoose.model("ProductImage", ProductImgesSchema)
const productThumbnailModel = mongoose.model("ProductThumbnail", poroduthumbnailSchema)
const ProductDescriptionImagesModel = mongoose.model("ProductDescriptionImage", producDetailsImagesSchema)
module.exports = { ProductModel, ProductImageModel, ProductDescriptionImagesModel, productThumbnailModel }