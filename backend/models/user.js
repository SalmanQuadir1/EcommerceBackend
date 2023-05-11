const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
        maxLength: [20, 'Length cannot be more than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter  your email'],
        unique: true,
        validate: [validator.isEmail, "Please enter correct email"]

    },
    phone: {
        type: String,
        required: [false, 'Please enter phoneNumber'],
        maxLength: [10, 'Phone No cannot be more than 10 characters'],


    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        maxLength: [6, 'Password cannot be more than 6 characters'],
        select: false


    },
    avatar: [
        {
            public_id: {
                type: String,
                required: false
            },
            url: {
                type: String,
                required: false
            }
        }

    ],
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now()

    }

   

})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
//Compare user passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//Return web token

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });

}
//Generate password Reset token
userSchema.methods.getResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash And Set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set token expire_time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken
}




module.exports = mongoose.model('user', userSchema);