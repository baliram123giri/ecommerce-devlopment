const Joi = require("joi")

const createOrderSchema = Joi.object({
    userId: Joi.string().trim().required(),
    totalAmount: Joi.number().required(),
    item: Joi.array().items(Joi.object({
        product: Joi.string().required(),
        owner: Joi.string().required(),
        quantity: Joi.number().required(),
        price: Joi.number().required()
    })).required(),
    shippingAddress: Joi.string().trim().required(),
    paymentMethod: Joi.string().trim().required()
})

module.exports = { createOrderSchema }