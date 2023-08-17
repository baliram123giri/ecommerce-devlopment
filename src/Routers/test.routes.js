const express = require("express")
const { errorMessage } = require("../utils/helpers.utils")
const path = require("path")
const { orderInvoiceModel } = require("../model/orderInvoice.model")
const router = express()
const puppeteer = require("puppeteer")
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

router.get("/generate-pdf/:id", async (req, res) => {
    try {
        const record = await orderInvoiceModel.findOne({ orderNumber: req.params.id })
        // res.render("index", { record })
        if (!record) return res.status(404).json("Order details not found!")

        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Wait for the canvas element to be visible

        await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(
            await renderTemplate('index', { record })
        )}`, { waitUntil: 'networkidle2' });

        await page.waitForSelector('img', { visible: true })
        await page.waitForSelector('.barcode', { visible: true })
        await page.waitForSelector('.bottom-barcode', { visible: true })

        const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 20, bottom: 20 } });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        errorMessage(res, error)
    }
})

// router.get("/pdf/:id", async (req, res) => {
//     try {
//         // const browser = await puppeteer.launch();
//         // const page = await browser.newPage()
//         // await page.goto(`${req.protocol}://${req.get("host")}/api/test/generate-pdf`, {
//         //     waitUntil:"networkidle2"
//         // })

//         // await page.setViewport({width:1680, height:1050})
//         // page.pdf()

//     } catch (error) {
//         errorMessage(res, error)
//     }
// })

module.exports = router