const { createOrderInvoice } = require("../Conrollers/OrderInvoice/OrderInvoice.controller")
const { authorize } = require("../utils/auth.utils")
const express = require("express")
const router = express()
const puppeteer = require("puppeteer")
const path = require("path")
const { errorMessage } = require("../utils/helpers.utils")
const { orderInvoiceModel } = require("../model/orderInvoice.model")
router.set('views', path.join(__dirname, '../views'));
router.set('view engine', 'ejs');

function renderTemplate(template, data) {
    return new Promise((resolve, reject) => {
        router.render(template, data, (err, html) => {
            if (err) { reject(err) }
            else {        // Wait for the canvas element to be visible

                resolve(html)

            };
        });
    });
}

//create route
router.post("/create", authorize("sellar"), createOrderInvoice)

//get route
router.get("/:id",  //get orderinVoice
    async function getOrderInvoice(req, res) {
        try {
            const record = await orderInvoiceModel
                .findOne({ orderNumber: req.params.id })
                .populate([
                    {
                        path: "orderNumber",
                        select: [
                            "shippingAddress",
                            "quantity",
                            "totalAmount",
                            "orderDate",
                            "paymentMethod",
                        ],
                        populate: [
                            {
                                path: "product",
                                select: ["title", "handlingFees"],
                            },
                        ],
                    },
                    { path: "sellar", select: ["address", "pan", "gst", "company"] },
                ]);

            if (!record) return res.status(404).json("Order details not found!");

            const {
                orderNumber: {
                    shippingAddress: { street, name, locality, landmark, pincode, state, city },
                    _id,
                    quantity,
                    paymentMethod,
                    product: { title, _id: productId },
                },
                sellar: {
                    address: {
                        city: sellarCity,
                        state: sellarState,
                        pincode: sellarPincode,
                        street: sellarStreet,
                    },
                    company,
                },
                awb
            } = record;

            let result = {
                quantity,
                paymentMethod,
                _id,
                awb,
                title,
                productId: String(productId),
                name,
                shippingAddress: `${street}, ${landmark}, ${locality}, ${city}-${pincode}, ${state}`,
                sellarAddress: `${company}, ${sellarStreet}, ${sellarCity}-${sellarPincode}, ${sellarState}`,
            };

            //generate pdf
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();

            // Wait for the canvas element to be visible

            await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(
                await renderTemplate('index', { result })
            )}`, { waitUntil: 'networkidle2' });

            await page.waitForSelector('img', { visible: true })
            await page.waitForSelector('.barcode', { visible: true })
            await page.waitForSelector('.bottom-barcode', { visible: true })

            const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 20, bottom: 20 } });

            await browser.close();
            const base64Data = pdf.toString('base64');

            res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
            res.status(200).json({ file: `data:application/pdf;base64,${base64Data}`, name: `OD${result._id}${new Date().getTime()}.pdf` });

        } catch (error) {
            errorMessage(res, error);
        }
    })
module.exports = router