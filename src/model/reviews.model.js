const mongoose = require("mongoose")

const ProductReviewsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    rating: {
        type: Number
    },
    description: String,
    title: String
}, { timestamps: true })

const ProductReviewsModel = mongoose.model("ProductReview", ProductReviewsSchema)

module.exports = { ProductReviewsModel }