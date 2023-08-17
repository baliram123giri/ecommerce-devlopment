const { DeliveryAddressModel } = require("../../model/deliveryAddress.model");
const { orderInvoiceModel } = require("../../model/orderInvoice.model");
const { Order } = require("../../model/orders.model");
const { ProductModel } = require("../../model/products.model");
const { errorMessage } = require("../../utils/helpers.utils");
const { createOrderSchema } = require("./validation");

async function createOrder(req, res) {
    try {
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
        // await Order.create({ ...req.body, userId: res.userId })
        res.json("Order Placed Successfully");
    } catch (error) {
        errorMessage(res, error);
    }
}
//find order by product and it's owner
async function findOrderByProductOwner(req, res) {
    const { role, userId } = res;
    try {
        const isCustomer = role === "customer";
        const orders = await Order.find(isCustomer ? { userId } : { owner: userId })
            .select(
                !isCustomer
                    ? ""
                    : [
                        "-owner",
                        "-orderDate",
                        "-paymentMethod",
                        "-userId",
                        "-totalAmount",
                        "-shippingAddress",
                    ]
            )
            .populate([
                {
                    path: "product",
                    select: [
                        "productThumbnail",
                        "title",
                        ...(!isCustomer ? ["handlingFees"] : ["discountedPrice"]),
                    ],
                    populate: [{ path: "productThumbnail", select: "pathname" }],
                },
                { path: "userId", select: ["email"] },
                { path: "deliverStatus" },
                //if not customer
                ...(!isCustomer
                    ? [{ path: "owner", select: ["address", "pan", "gst", "company"] }]
                    : []),
            ])
            .then(async (data) => {
                for (const key of data) {
                    const isInvoice = await orderInvoiceModel.findOne({
                        orderNumber: key._id,
                    });

                    if (isInvoice) {
                        const index = data.findIndex(
                            (ele) => String(ele._id) === String(isInvoice.orderNumber)
                        );
                        let currentObj = { ...data[index], sheduled: true };
                        // currentObj["sheduled"] = "hello"
                        data[index] = { ...currentObj._doc, sheduled: currentObj.sheduled };
                    }
                }
                return data;
            });

        res.json(orders);
    } catch (error) {
        errorMessage(res, error);
    }
}

//find order by id
async function findOrderById(req, res) {
    try {
        const { id } = req.params;
        if (!id) return res.status(404).json("order details not found!");
        //if id is valid
        const record = await Order.findById(id).select(["-userId", "-orderDate", "-paymentMethod"]).populate([
            { path: "owner", select: "company" },
            { path: "deliverStatus" },
            { path: "shippingAddress" },
            {
                path: "product",
                select: ["title", "discountedPrice"],
                populate: [{ path: "productThumbnail", select: "pathname" }],
            },
        ]);
        res.json(record);
    } catch (error) {
        errorMessage(res, error);
    }
}

//update order
async function updateOrder(req, res) {
    try {
        const record = await Order.findById(req.params.id)
        if (!record) return res.status(404).json("Order details not fond!")
        //if yes
        //find order user address
        const orderUserAddress = await DeliveryAddressModel.findById(req.body.shippingAddress).select("-_id")
        await Order.findByIdAndUpdate(req.params.id, { ...(req.body.shippingAddress ? { shippingAddress: orderUserAddress } : {}) })
        res.json("Address updated successfully")
    } catch (error) {
        errorMessage(res, error);
    }
}
async function updateOrderMobileNumber(req, res) {
    try {
        const record = await Order.findById(req.params.id)
        if (!record) return res.status(404).json("Order details not fond!")
        //if yes
        await Order.findByIdAndUpdate(req.params.id, { shippingAddress: { ...record.shippingAddress, mobile: req.body.mobile, aleternateMobile: req.body.alternateMobile } })
        res.json("Mobile number updated successfully")
    } catch (error) {
        errorMessage(res, error);
    }
}

module.exports = { createOrder, findOrderByProductOwner, findOrderById, updateOrder, updateOrderMobileNumber };
