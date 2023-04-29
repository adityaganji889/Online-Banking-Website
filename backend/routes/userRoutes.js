const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const Moralis = require('moralis').default;
const cookieParser = require('cookie-parser');
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const ethers = require('ethers')

const config = {
  domain: process.env.APP_DOMAIN,
  statement: 'Please sign this message to confirm your identity.',
  uri: process.env.REACT_URL,
  timeout: 60,
};



// register user account

router.post('/register', async(req,res)=> {
    try{
       // check if user already exists
       let user = await User.findOne({email : req.body.email})
       if(user){
        return res.send({
            success: false,
            message: "User already exists",
        })
       }
       // hash password
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(req.body.password,salt)
       req.body.password = hashedPassword;
       const newUser = new User(req.body)
       await newUser.save();
       res.send({
        message: "User created successfully",
        data: null,
        success: true,
       })
    }
    catch(error){
        res.send({
            message: error.message,
            success: false,
        })
    }
})

// router.post('/login', async(req,res)=>{
//     try{
//       //check if user exists
//       let user = await User.findOne({email : req.body.email})
//       if(!user){
//         return res.send({
//             message: "User does not exist",
//             success: false,
//         })
//       }
//       //check if password is correct
//       const validPassword = await bcrypt.compare(req.body.password, user.password)
//       if(!validPassword){
//         return res.send({
//             success: false,
//             message: "Invalid password",
//         })
//       }
      
//       if(!user.isVerified){
//         return res.send({
//           success: false,
//           message: "user is not verified yet or has been suspended",
//         })
//       }
//       //generate token
//       const token = jwt.sign({userid: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
//       res.send({
//         message: "User logged in successfully",
//         success: true,
//         data: token,
//       }) 
//     }
//     catch(error){
//       res.send({
//         message: error.message,
//         success: false,
//       })
//     }
// })

// get user info
router.post("/get-user-info",authMiddleware,async(req,res)=>{
    try{
      const user = await User.findById(req.body.userid);
      user.password = "";
      res.send({
        message: "user info fetched successfully",
        data: user,
        success: true,
      })
    }
    catch(error){
      res.send({
        message: error.message,
        success: false,
      })
    }
})


// request message to be signed by client
router.post('/request-message', async (req, res) => {
  const { address, chain } = req.body;

  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      ...config,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});


router.post('/verify', async (req, res) => {
  try {
    const { message, signature, values } = req.body;

    const { address, profileId } = (
      await Moralis.Auth.verify({
        message,
        signature,
      })
    ).raw;

    const user = { address, profileId, signature, values };

    // check if user already exists
    let newUsers = await User.findOne({email : req.body.values.email})
    if(!newUsers){
      return res.send({
          message: "User does not exist",
          success: false,
          data: null
      })
    }
     //check if password is correct
     const validPassword = await bcrypt.compare(req.body.values.password, newUsers.password)
     if(!validPassword){
       res.send({
           success: false,
           message: "Invalid password",
           data: null
       })
     }
     if(!newUsers.isVerified){
       res.send({
         success: false,
         message: "user is not verified yet or has been suspended",
         data: null
       })
     }
    if(newUsers.walletAddress!==""&&newUsers.walletAddress!==address){
    res.send({
      message: "You're trying to access some other user's wallet. Access Denied.",
      success: false,
      data: null,
    })   
    }
    else if(newUsers.walletAddress!==""&&newUsers.walletAddress===address){
      //generate token
      // const provider = ethers.getDefaultProvider('goerli')
      const chain = EvmChain.GOERLI;
      // const response = await Moralis.EvmApi.balance.getNativeBalance({
      //   address,
      //   chain,
      // });
      const provider = ethers.getDefaultProvider('goerli');
      let balanceInEth = await provider.getBalance(address);
      balanceInEth = ethers.utils.formatEther(balanceInEth);
      let result = parseFloat(balanceInEth);
      result = (result/1E18).toFixed(4);
      newUsers.balance = parseFloat(result);
      const newUser = await newUsers.save();
      const token = jwt.sign({userid: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
      res.send({
        message: "User logged in successfully",
        success: true,
        data: token,
      })   
      }
    else{
      //generate token
      newUsers.profileId = profileId;
      newUsers.walletAddress = address;
      const newUser = await newUsers.save();
      const token = jwt.sign({userid: newUser._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
      res.send({
        message: "User logged in successfully",
        success: true,
        data: token,
      }) 
    }
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
      data: null
    })
  }
});


//get all users
router.get("/get-all-users",authMiddleware,async(req,res)=>{
  try{
    const user = await User.findOne({ _id: req.body.userid})
    if(user.isAdmin){
    const users = await User.find();
    res.send({
     data: users,
     message: "Users fetched successfully",
     success: true,
    })
   }
  }
  catch(error){
   console.log("error:",error);
   res.send({
    message: error.message,
    success: false,
   })
  }
})

// update user verified status
router.post('/update-user-verified-status',authMiddleware,async(req,res)=>{
  try{
     const user = await User.findOne({_id: req.body.selectedUser})
     if(user._id!==req.body.userid){
     await User.findByIdAndUpdate(req.body.selectedUser,{
      isVerified: req.body.isVerified,
    })
    res.send({
      data: null,
      message: "User verified status updated successfully",
      success: true,
    })
   }
  }
  catch(error){
    res.send({
      data: null,
      message: error.message,
      success: false,
    })
  }
})

module.exports = router;