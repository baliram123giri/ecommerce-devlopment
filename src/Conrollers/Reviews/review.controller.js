const Joi = require("joi");
const { ProductReviewsModel } = require("../../model/reviews.model");
const { errorMessage } = require("../../utils/helpers.utils");
const { createReviewValidation } = require("./validators");
const { default: mongoose } = require("mongoose");

async function createReview(req, res) {
    try {
        await createReviewValidation.validateAsync(req.body);
        const isReview = await ProductReviewsModel.findOne({
            userId: res.userId,
            productId: req.body.productId,
        });
        if (isReview)
            return res.status(400).json("You already rated to this product!");
        await ProductReviewsModel.create({ ...req.body, userId: res.userId });
        res.json("Review Added Successfully");
    } catch (error) {
        errorMessage(res, error);
    }
}

//get review base on given productid
async function getProductReviews(req, res) {
    try {
        const review = await ProductReviewsModel.find({
            productId: req.params.productId,
        })
            .populate([{ path: "userId", select: ["firstname", "lastname"] }])
            .select(["rating", "title", "description", "createdAt"]);
        res.json(review);
    } catch (error) {
        errorMessage(res, error);
    }
}

//get reviews list
async function getProductReviewsList(req, res) {
    try {
        const review = await ProductReviewsModel.aggregate([
            { $sample: { size: 25 } },
            {
                $lookup: {
                    from: "products",
                    foreignField: "_id",
                    localField: "productId",
                    as: "product",
                    pipeline: [
                        {
                            $lookup: {
                                from: "productthumbnails",
                                localField: "productThumbnail",
                                foreignField: "_id",
                                as: "images",
                            },
                        },
                        { $unwind: "$images" }
                    ],
                },
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    description: 1,
                    createdAt:1,
                    title: 1,
                    image: "$product.images.pathname",
                    title:"$product.title",
                    fullname: { $concat: ["$user.firstname", " ", "$user.lastname"] }
                },
            },
        ]);
        res.json(review);
    } catch (error) {
        errorMessage(res, error);
    }
}

async function getProductStars(req, res) {
    try {
        const stars = await ProductReviewsModel.aggregate([
            {
                $match: {
                    productId: new mongoose.Types.ObjectId(req.params.productId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    averageRating: { $round: ["$averageRating", 1] },
                    count: 1,
                },
            },
        ]);
        if (!stars.length) res.status(404).json("no reviews for this prodcut");
        res.json(stars[0]);
    } catch (error) {
        errorMessage(res, error);
    }
}

//delete review
async function deleteReview(req, res) {
    try {
        const deleteReview = await ProductReviewsModel.findByIdAndDelete(
            req.params.reviewId
        );
        if (!deleteReview) return res.status(404).json("Review Id is not found");
        res.json("Review Deleted Successfully...");
    } catch (error) {
        errorMessage(res, error);
    }
}
module.exports = {
    createReview,
    getProductReviews,
    getProductStars,
    deleteReview,
    getProductReviewsList,
};
