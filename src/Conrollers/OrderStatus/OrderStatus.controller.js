const { OrderStatus } = require("../../model/orderStatus.model");
const { errorMessage } = require("../../utils/helpers.utils");
const { createOrderStatusSchema } = require("./validation");

async function createStatus(req, res) {
    try {
        await createOrderStatusSchema.validateAsync(req.body)
        await OrderStatus.create(req.body)
        res.json("Status created successfully")
    } catch (error) {
        errorMessage(res, error)
    }
}

module.exports={createStatus}