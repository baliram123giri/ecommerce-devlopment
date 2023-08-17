const Joi = require("joi")

const createOrderStatusSchema = Joi.object({
    name: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
})

module.exports = { createOrderStatusSchema }