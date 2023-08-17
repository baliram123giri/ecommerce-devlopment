
const { DeliveryAddressModel } = require("../../model/deliveryAddress.model");
const { errorMessage } = require("../../utils/helpers.utils");
const { addressValidationSchema, updateAddressValidationSchema } = require("./validation");

//create address
async function createDeliveryAddress(req, res) {
    const { userId } = res
    try {
        await addressValidationSchema.validateAsync(req.body)
        const record = await DeliveryAddressModel.findOne({ ...req.body, userId })
        if (record) return res.status(400).json("Adress already exist!")
        const result = await DeliveryAddressModel.create({ ...req.body, userId }).then((res) => res._id)
        res.json({ message: "Adress Added Successfully", data: result })

    } catch (error) {
        errorMessage(res, error)
    }
}

async function addressList(req, res) {
    try {
        const { userId } = res
        const records = await DeliveryAddressModel.find({ userId }).select(["-userId", "-mobile"]).sort({ createdAt: -1 })
        res.json(records)
    } catch (error) {
        errorMessage(res, error)
    }
}

async function updateDeliveryAddress(req, res) {
    try {
        const record = await DeliveryAddressModel.findById(req.params.id)
        if (!record) return res.status(404).json("Address details not found!")
        //if yes check fields should be not blank and values types should match
        await updateAddressValidationSchema.validateAsync(req.body)
        await DeliveryAddressModel.findByIdAndUpdate(req.params.id, req.body)
        res.json("Address updated successfully")
    } catch (error) {
        errorMessage(res, error)
    }
}

module.exports = { createDeliveryAddress, addressList , updateDeliveryAddress}