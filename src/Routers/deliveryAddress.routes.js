const { createDeliveryAddress, addressList, updateDeliveryAddress } = require("../Conrollers/DeliveryAddress/DeliveryAddress.controller")
const { authorize } = require("../utils/auth.utils")

const router = require("express").Router()
//create route
router.post("/create", authorize("customer"), createDeliveryAddress)

//get list
router.get("/list", authorize("customer"), addressList)

//update address
router.put("/update/:id", authorize("customer"), updateDeliveryAddress)

module.exports = router