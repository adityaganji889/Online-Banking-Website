const mongoose = require('mongoose');
const Transaction = require('./transactionModel')
const Request = require('./requestsModel')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    identificationType: {
        type: String,
        required: true,
    },
    identificationNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
   },
   {
    timestamps: true,
   }
)

userSchema.post('remove',async function(req,next){
    await Transaction.remove({sender: this._id})
    await Request.remove({sender: this._id})
    next()
})

module.exports = mongoose.model("users",userSchema);