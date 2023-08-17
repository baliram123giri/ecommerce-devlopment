const mongoose = require("mongoose");
const { generateCustomNumber } = require("../utils/auth.utils");
const { addressTypes } = require("./deliveryAddress.model");

const OrdersSchema = new mongoose.Schema({
    id: {
        type: String,
        default: function () {
            // Step 2: Generate the custom ID
            const counterValue = generateCustomNumber(); // Call your custom ID generator function
            return `OD${counterValue.toString().padStart(18, "0")}`;
        },
        unique: true,
    },
    userId:
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ,
    quantity: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId, ref: "User", required: true
    },
    deliverStatus: {
        type: mongoose.Schema.Types.ObjectId, ref: "OrderStatus",
        enum: ["64549bb4b9076e895cc9c416", "64549bb4b9076e895cc9c417",
            "64549bb4b9076e895cc9c418", "64549bb4b9076e895cc9c415",
            "64549bb4b9076e895cc9c419", "64549bb4b9076e895cc9c41c",
            "64549bb4b9076e895cc9c41b", "64549bb4b9076e895cc9c41a", "6479d9826f0993b17d156b3c"],
        default: "64549bb4b9076e895cc9c415"
    },
    shippingAddress: addressTypes,
    orderDate: {
        type: Date,
        default: Date.now()
    },
    paymentMethod: {
        type: String,
        required: true
    }

})

const Order = mongoose.model("Order", OrdersSchema)

module.exports = { Order }