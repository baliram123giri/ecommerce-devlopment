const Joi = require("joi")
const addtagsSchema = Joi.object({
    name: Joi.string().trim().required(),
    category: Joi.string().required(),
    subcategory:Joi.string().required()
})

const idParams = Joi.object({
    id: Joi.string().required().trim().message({
        "any.required": "Id params is required!!",
    })
})
const deleteSelectdSchema = Joi.array().items(Joi.string().required()).required()
module.exports = { addtagsSchema, idParams, deleteSelectdSchema }