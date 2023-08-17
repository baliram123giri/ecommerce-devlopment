const mongoose = require("mongoose")
const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    company: {
        type: String
    },
    address: {
        pincode: {
            type: Number,
        },
        mobile: {
            type: Number
        },
        state: {
            type: String
        },
        country: {
            type: String
        },
        city: {
            type: String
        },
        street: {
            type: String
        },

    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "customer"
    },
    gst: {
        type: String,
        required: function () {
            return this.role === "sellar"
        }
    },
    pan: {
        type: String,
        required: function () {
            return this.role === "sellar"
        }
    }

}, { timestamps: true })

const UserModel = mongoose.model("User", UserSchema)

module.exports = { UserModel }