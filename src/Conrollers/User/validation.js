
const joi = require("joi")

//create signup validation schema
const userSchema = joi.object({
    firstname: joi.string().required().trim().messages({
        "any.required": " Fisrt Name is required!!",
        "string.empty": "first name can't be empty!!",
    }),
    lastname: joi.string().required().trim().messages({
        "any.required": " Last Name is required!!",
        "string.empty": "Last name can't be empty!!",
    }),
    company: joi.string().optional(),
    email: joi.string().email().required().trim().messages({
        "any.required": " Email is required!!",
        "string.empty": "Email can't be empty!!",
        "string.email": "Invalid Email!!",
    }),
    role: joi.string().optional(),
    password: joi.string().required().trim().messages({
        "any.required": " Password is required!!",
        "string.empty": "Password can't be empty!!",
    }),
    address: joi.when("role", {
        is: "sellar",
        then: joi.object({
            pincode: joi.number().required(),
            mobile: joi.number().required(),
            state: joi.string().required(),
            country: joi.string().required(),
            city: joi.string().required(),
            street: joi.string().required(),
        }).required(),
        otherwise: joi.object({
            pincode: joi.number(),
            mobile: joi.number(),
            state: joi.string(),
            country: joi.string(),
            city: joi.string(),
            street: joi.string(),
        }).optional()
    }),
    pan: joi.string().when("role", {
        is: "sellar",
        then: joi.string().required(),
        otherwise: joi.string()
    }),
    gst: joi.string().when("role", {
        is: "sellar",
        then: joi.string().required(),
        otherwise: joi.string()
    }),

})

const userSignInSchema = joi.object({
    email: joi.string().email().required().trim().messages({
        "any.required": " Email is required!!",
        "string.empty": "Email can't be empty!!",
        "string.email": "Invalid Email!!",
    }),
    password: joi.string().required().trim().messages({
        "any.required": " Password is required!!",
        "string.empty": "Password can't be empty!!",
    })
})

module.exports = { userSchema, userSignInSchema }