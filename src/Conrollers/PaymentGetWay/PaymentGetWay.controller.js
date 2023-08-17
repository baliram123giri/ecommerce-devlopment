const { DeliveryAddressModel } = require('../../model/deliveryAddress.model');
const { errorMessage } = require('../../utils/helpers.utils');
const { createOrderSchema } = require('../Order/validation');
const {Order} = require("../../model/orders.model")
// This is your test secret API key.
const stripe = require('stripe')('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');

async function paymetCreate(req, res) {
    // req.body.map((ele) => {
    //     return {
    //         price_data: {
    //             currency: "inr",
    //             product_data: {
    //                 name: ele.product
    //             },
    //             unit_amount: 1 * 100
    //         },
    //         quantity: 1
    //     }
    // })
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "testing"
                    },
                    unit_amount: 1 * 100
                },
                quantity: 1
            }]

            ,
            success_url: 'http://localhost:5173/payment/success',
            cancel_url: 'http://localhost:5173/payment/failed',
        });
        await createOrderSchema.validateAsync({ ...req.body, userId: res.userId });
        const { item, shippingAddress, ...rest } = req.body;
        //find order user address
        const orderUserAddress = await DeliveryAddressModel.findById(shippingAddress).select("-_id")
        for (const { product, price, quantity, owner } of item) {
            await Order.create({
                ...rest,
                shippingAddress: orderUserAddress,
                product,
                quantity,
                totalAmount: price,
                owner,
                userId: res.userId,
            });
        }
        res.json(session.url);
      
    } catch (error) {
        errorMessage(res, error)
    }
}
module.exports = { paymetCreate }