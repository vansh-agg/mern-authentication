const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
require('dotenv').config()
const keysecret = process.env.KEY_SECRET
const userschema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]

})

//password hash

userschema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12)
        this.cpassword = await bcrypt.hash(this.cpassword, 12)
    }

    next()
})

//token generate

userschema.methods.generateAuthtoken = async function () {
    try {
        let token23 = jwt.sign({ _id: this._id }, keysecret, {
            expiresIn: "1d"
        })
        this.tokens = this.tokens.concat({ token: token23 })
        await this.save();
        return token23;
    } catch (err) {
        res.status(422).json(err)
    }
}

const user = new mongoose.model("user", userschema)

module.exports = user