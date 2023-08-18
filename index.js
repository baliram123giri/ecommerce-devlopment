const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

mongoose
  .connect(
    `${process.env.URL}`
  )
  .then(() => console.log("connection success"))
  .catch((err) => console.log(err));
const PORT = process.env.PORT || 4000
app.use(cookieParser());
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/user", require("./src/Routers/User/users.router"));
app.use(
  "/api/user/deliveryAddress",
  require("./src/Routers/deliveryAddress.routes")
);
app.use("/api/category", require("./src/Routers/category/category.router"));
app.use("/api/tags", require("./src/Routers/tags.router"));
app.use("/api/product", require("./src/Routers/product.routes"));
app.use("/api/product/slider", require("./src/Routers/productHomeSlider.routes"));
app.use("/api/product/review", require("./src/Routers/review.routes"));
app.use("/api/product/order", require("./src/Routers/order.routes"));
app.use("/api/order/status", require("./src/Routers/orderStatus.routes"));
app.use("/api/order/invoice", require("./src/Routers/orderInvoice.routes"));
app.use("/api/test", require("./src/Routers/test.routes"));
app.use("/api/payment", require("./src/Routers/payment.routes"));

app.use((req, res, next) => {
  res.status(404).json("Url not found");
});
app.listen(PORT, () => console.log(`${PORT} Server running`));
