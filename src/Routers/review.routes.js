const { createReview, getProductReviews, getProductStars, deleteReview, getProductReviewsList } = require("../Conrollers/Reviews/review.controller")
const { authorize, normalAuth } = require("../utils/auth.utils")

const router = require("express").Router()

//create reviews
router.post("/create", authorize("customer"), createReview)
//get products reviews
router.get("/all/:productId",normalAuth(), getProductReviews)
router.get("/stars/:productId",normalAuth(), getProductStars)
router.get("/list", getProductReviewsList)
router.delete("/:reviewId", deleteReview)
module.exports = router