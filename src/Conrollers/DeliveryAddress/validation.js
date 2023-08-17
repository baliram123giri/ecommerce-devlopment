const Joi = require("joi")

const addressValidationSchema = Joi.object({
    name: Joi.string().trim().optional(),
    street: Joi.string().trim().required(),
    locality: Joi.string().trim().required(),
    landmark: Joi.string().trim().required(),
    mobile: Joi.number().required(),
    aleternateMobile: Joi.number().optional(),
    pincode: Joi.number().required(),
    state: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    adressType: Joi.string().trim().optional()
})

const updateAddressValidationSchema = Joi.object({
    name: Joi.string().trim().optional(),
    street: Joi.string().trim().optional(),
    locality: Joi.string().trim().optional(),
    landmark: Joi.string().trim().optional(),
    mobile: Joi.number().optional(),
    aleternateMobile: Joi.number().optional(),
    pincode: Joi.number().optional(),
    state: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    adressType: Joi.string().trim().optional()
})

module.exports = { addressValidationSchema, updateAddressValidationSchema }