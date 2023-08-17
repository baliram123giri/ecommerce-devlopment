const Joi = require("joi")


const addProductSchema = Joi.object({
    createdBy: Joi.string().trim().required(),
    title: Joi.string().trim().required(),
    productName: Joi.string().trim().required(),
    quantity: Joi.number().required(),
    price: Joi.number().required(),
    discountedPrice: Joi.number().required(),
    desc: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    productThumbnail: Joi.any().optional,
    subCategory: Joi.string().trim().required(),
    isPublish: Joi.boolean().required(),
    images: Joi.any().optional(),
    tags: Joi.any().required(),
    productDetails: Joi.any().optional(),
    handlingFees: Joi.number().optional()
})



const addProductSliderSchema = Joi.object({
    category: Joi.string().required(),
    subCategory: Joi.string().required(),

})
const paramsId = Joi.object({
    id: Joi.string().required()
})
module.exports = { addProductSchema, addProductSliderSchema, paramsId }