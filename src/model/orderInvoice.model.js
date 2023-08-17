const mongoose = require("mongoose")

const orderInvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true
    },
    orderNumber: {
        type: mongoose.Schema.Types.ObjectId, ref: "Order",
        required: true
    },
    awb: {
        type: String,
        required: true
    },
    sellar: {
        type: mongoose.Schema.Types.ObjectId, ref: "User",
        required: true
    },
    date: {
        type: String,
        required: true
    },
}, { timestamps: true })

const orderInvoiceModel = mongoose.model("OrderInvoice", orderInvoiceSchema)

module.exports = { orderInvoiceModel }