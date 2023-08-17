const { paymetCreate } = require("../Conrollers/PaymentGetWay/PaymentGetWay.controller")
const { authorize } = require("../utils/auth.utils")

const router = require("express").Router()

router.post("/create-checkout-session", authorize("customer"), paymetCreate)
module.exports = router