const mongoose = require('mongoose')


const requestSchema = new mongoose.Schema({
   sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
   },
   receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
   },
   amount: {
     type: Number,
     required: true,
   },
   description: {
    type: String,
    required: true,
   },
   senderWalletAddress: {
    type: String,
    required: true
   },
   receiverWalletAddress: {
    type: String,
    default: ""
   },
   transactionHash: {
    type: String,
    default: ""
   },
   status: {
    type: String,
    default: "pending",
   }
 },
 {
    timestamps: true,
 }
)

module.exports = mongoose.model("requests", requestSchema)