const Joi = require("joi")

const createReviewValidation = Joi.object({
    productId: Joi.string().trim().required(),
    rating: Joi.number().required(),
    description: Joi.string().trim().required(),
    title: Joi.string().trim().required(),
})

module.exports = { createReviewValidation }