const express = require("express");
const app = express();
const cors = require("cors")
const mongoose = require("mongoose");
const path = require('path');
const cookieParser = require('cookie-parser');
mongoose
    .connect(
        `mongodb+srv://fastrack:RhTRsnf0OTKJsLer@cluster0.ow9bv.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => console.log("connection success"))
    .catch((err) => console.log(err));

app.use(cookieParser())
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/user", require("./Routers/User/users.router"));
app.use("/api/user/deliveryAddress", require("./Routers/deliveryAddress.routes"));
app.use("/api/category", require("./Routers/category/category.router"));
app.use("/api/tags", require("./Routers/tags.router"));
app.use("/api/product", require("./Routers/product.routes"));
app.use("/api/product/slider", require("./Routers/productHomeSlider.routes"));
app.use("/api/product/review", require("./Routers/review.routes"));
app.use("/api/product/order", require("./Routers/order.routes"));
app.use("/api/order/status", require("./Routers/orderStatus.routes"));
app.use("/api/order/invoice", require("./Routers/orderInvoice.routes"));
app.use("/api/test", require("./Routers/test.routes"));
app.use("/api/payment", require("./Routers/payment.routes"));

app.use((req, res, next) => {
    res.status(404).json("Url not found");
});
app.listen(4000, () => console.log(`${4000} Server running`));
