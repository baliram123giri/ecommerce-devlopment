const { UserModel } = require("../../model/users.module")
const { generateAccessToken, setAccessTokenCookie } = require("../../utils/auth.utils")
const { userSchema, userSignInSchema } = require("./validation")
const bcrypt = require("bcryptjs")

//sign up user
async function signUp(req, res) {
    try {
        const { ...rest } = req.body
        const { error, value } = userSchema.validate(rest)
        if (error) {
            res.status(400).json({ message: error.details[0].message })
        } else {
            const record = await UserModel.findOne({ email: req.body.email })
            if (record) {
                return res.status(500).json("user already exist!")
            }
            await UserModel.create({ ...value, password: bcrypt.hashSync(value.password, 10) })
            res.status(200).json("user created successfully")
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
}


// sign user 
async function signIn(req, res) {
    try {
        const { error, value } = userSignInSchema.validate(req.body)

        if (error) {
            res.status(400).json({ message: error.details[0].message })
        }
        else {
            const findUser = await UserModel.findOne({ email: value.email })
            if (!findUser) {
                res.status(402).json("user email or password are incorrect!!")
            } else {
                const hasPassCheck = await bcrypt.compare(value.password, findUser.password)
                if (!hasPassCheck) {
                    res.status(402).json("user email or password are incorrect!!")
                } else {
                    const { password, ...rest } = findUser._doc
                    const token = generateAccessToken(rest)
                    setAccessTokenCookie(res, token);
                    res.status(200).json(rest)
                }
            }
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
}

//logout
async function logout(req, res) {
    try {
        res.cookie("access_token", "", { maxAge: 1 })
        res.status(200).json("User Logout successfully...")
    } catch (error) {

    }
}
module.exports = { signIn, signUp, logout }