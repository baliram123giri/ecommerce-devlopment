const Joi = require("joi")

// Joi validation schema for the category data
const categoryValidationSchema = Joi.object({
    name: Joi.string().required(),
    subCategory: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
        })
    ).unique(),
});

const updateSchemaValidation = Joi.object({
    name: Joi.string().optional(),
    subCategory: Joi.array().items(Joi.object({ name: Joi.string().required() })).optional()
})

const paramsSchema = Joi.object({ id: Joi.string().required(), categoryId: Joi.string().required() })
const paramsIdSchema = Joi.object({ id: Joi.string().required() })

const deleteMultiCategoriesSchema = Joi.array().items(Joi.string()).required()

module.exports = { categoryValidationSchema, updateSchemaValidation, paramsSchema, paramsIdSchema, deleteMultiCategoriesSchema }