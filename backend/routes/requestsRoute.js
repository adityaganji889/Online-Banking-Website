const router = require('express').Router();
const { request } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const Request = require('../models/requestsModel');
const User = require('../models/userModel')
const Transaction = require('../models/transactionModel')
const ethers = require('ethers')

//get all requests to a user
router.post('/get-all-requests-by-user',authMiddleware,async(req,res)=>{
    try{
       const requests = await Request.find({
        $or: [{sender: req.body.userid},{receiver: req.body.userid}],
       }).sort({createdAt: -1}).populate('sender').populate('receiver');
       res.send({
        message: "Requests Fetched Successfully",
        data: requests,
        success: true,
       })
    }
    catch(error){
       res.status(500).json({error: error.message});
    }
})


//send a request to another user

router.post("/send-request",authMiddleware, async(req,res)=>{
    try{
        const request = new Request({
            sender: req.body.userid,
            receiver: req.body.receiver,
            amount: req.body.amount,
            description: req.body.reference,
            senderWalletAddress: req.body.senderWalletAddress,
            receiverWalletAddress: req.body.receiverWalletAddress,
            status: req.body.status,
        });
        await request.save();
        res.send({
            data: request,
            message: "Request sent successfully",
            success: true,
        });
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

//update request status

router.post('/update-request-status',authMiddleware, async(req,res)=>{
    try{
      if(req.body.status === "accepted"){
        //create a transaction
        const transaction = new Transaction({
            sender: req.body.receiver,
            receiver: req.body.sender,
            senderWalletAddress: req.body.receiverWalletAddress,
            receiverWalletAddress: req.body.senderWalletAddress,
            transactionHash: req.body.transactionHash,
            amount: req.body.amount,
            reference: req.body.description,
            status: req.body.transactionHash!==""?"success":"failed" 
        });
        await transaction.save()
        // update the balance of the users
        // add the amount to the sender (Who has sent the request)
        const provider = ethers.getDefaultProvider('goerli'); 
        //decrease the sender's balance 
        const sender = await User.findOne({_id:req.body.sender._id})
        let balanceInEthSender = await provider.getBalance(sender.walletAddress);
        balanceInEthSender = ethers.utils.formatEther(balanceInEthSender);
        let balanceLeftSender = parseFloat(balanceInEthSender);
        sender.balance = parseFloat(balanceLeftSender);
        await sender.save();
        // await User.findByIdAndUpdate(req.body.sender._id,{
        //     $inc: { balance: +req.body.amount }
        // })
        // deduct the amount from the receiver (Who has received the request)
        // await User.findByIdAndUpdate(req.body.receiver._id,{
        //     $inc: { balance: -req.body.amount }
        // })
        // update the request status
        const receiver = await User.findOne({_id:req.body.receiver})
        let balanceInEthReceiver = await provider.getBalance(receiver.walletAddress);
        balanceInEthReceiver = ethers.utils.formatEther(balanceInEthReceiver);
        let balanceLeftReceiver = parseFloat(balanceInEthReceiver);
        receiver.balance = parseFloat(balanceLeftReceiver);
        await receiver.save();
        await Request.findByIdAndUpdate(req.body._id,{
            status: req.body.status,
            transactionHash: req.body.transactionHash
        })
      }
      else{
        await Request.findByIdAndUpdate(req.body._id,{
            status: req.body.status,
        })
      }
      res.send({
        data: null,
        message: "Request status updated successfully",
        success: true,
      })
    }
    catch(error){
      res.send({
        data: null,
        message: "Request status did not get updated successfully",
        success: false,
      })
    }
})



module.exports = router;