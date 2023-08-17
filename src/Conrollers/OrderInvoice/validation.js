const Joi = require("joi")

const orderInvoiceCreateValidation = Joi.object({
    invoiceNumber: Joi.string().trim().required(),
    orderNumber: Joi.string().trim().required(),
    sellar: Joi.string().trim().required(),
    date: Joi.string().trim().required(),
    awb: Joi.string().trim().required(),
})

module.exports = { orderInvoiceCreateValidation }