const router = require("express").Router()
const { signUp, signIn, logout } = require("../../Conrollers/User/users.controllers")

///create a user
router.post("/signup", signUp)
router.post("/signin", signIn)
router.get("/logout", logout)


module.exports = router