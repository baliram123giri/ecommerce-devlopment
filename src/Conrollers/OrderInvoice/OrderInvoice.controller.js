const { default: mongoose } = require("mongoose");
const { orderInvoiceModel } = require("../../model/orderInvoice.model");
const { errorMessage } = require("../../utils/helpers.utils");
const { orderInvoiceCreateValidation } = require("./validation");
const { Order } = require("../../model/orders.model");

//create order invoice
async function createOrderInvoice(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await orderInvoiceCreateValidation.validateAsync(req.body);
        const record = await orderInvoiceModel.findOne({
            orderNumber: req.body.orderNumber,
        });
        if (record)
            return res
                .status(400)
                .json("Order invoice already generated to this order!");
        //if not
        const orderInvoice = new orderInvoiceModel(req.body);
        await orderInvoice.save({ session: session });

        await Order.findOneAndUpdate(
            { _id: req.body.orderNumber },
            { $set: { deliverStatus: "6479d9826f0993b17d156b3c" } }
        ).session(session);

        await session.commitTransaction();
        res.json("Invoice generated successfully");
    } catch (error) {
        await session.abortTransaction();
        errorMessage(res, error);
    } finally {
        await session.endSession();
    }
}


module.exports = { createOrderInvoice };
