const mongoose = require("mongoose")
const addressTypes = {
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    },
    aleternateMobile: {
        type: Number,
    },
    adressType: {
        type: String,
        required: true,
        enum: ["home", "work"],
        default: "home"
    }
}
const DeliveryAddressSchema = new mongoose.Schema(addressTypes, { timestamps: true })

const DeliveryAddressModel = mongoose.model("DeliveryAddress", DeliveryAddressSchema)

module.exports = { DeliveryAddressModel, addressTypes }