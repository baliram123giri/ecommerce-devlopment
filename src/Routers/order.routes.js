const { createOrder, findOrderByProductOwner, findOrderById, updateOrder, updateOrderMobileNumber } = require("../Conrollers/Order/Order.controller")
const { authorize } = require("../utils/auth.utils")

const router = require("express").Router()

//create the order
router.post("/create", authorize("customer"), createOrder)
//get the order by its owner
router.get("/owner", authorize("sellar", "customer"), findOrderByProductOwner)
//find order by id
router.get("/:id", authorize("sellar", "customer"), findOrderById)
//update order by id and newAddresID
router.put("/:id", authorize("customer"), updateOrder)
router.put("/update_mobile/:id", authorize("customer"), updateOrderMobileNumber)

module.exports = router