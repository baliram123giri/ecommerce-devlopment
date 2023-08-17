const mongoose = require("mongoose")
const OrderStatusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    color: {
        type: String,
        required: true
    }
})

const OrderStatus = mongoose.model("OrderStatus", OrderStatusSchema)
module.exports = { OrderStatus }