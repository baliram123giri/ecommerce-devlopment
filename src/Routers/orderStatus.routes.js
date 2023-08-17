const { createStatus } = require("../Conrollers/OrderStatus/OrderStatus.controller")
const { authorize } = require("../utils/auth.utils")

const router = require("express").Router()
//create status
router.post("/create", authorize("admin"),createStatus)
module.exports = router