const express = require('express');
const app = express();
require('dotenv').config()
const dbConfig = require('./config/dbConfig');
const userRoute = require('./routes/userRoutes');
const transactionRoute = require('./routes/transactionsRoute');
const requestRoute = require('./routes/requestsRoute');
const cookieParser = require('cookie-parser');
const Moralis = require('moralis').default;
const cors = require('cors')
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const port = process.env.PORT || 5000

app.use(
   cors({
     origin: 'http://localhost:3000',
     credentials: true,
 })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/users',userRoute);
app.use('/api/transactions',transactionRoute);
app.use('/api/requests',requestRoute);

// app.listen(PORT, ()=>{
//    console.log(`Server running on Port ${PORT}`);
// })

const startServer = async() => {
   await Moralis.start({
       apiKey: process.env.MORALIS_API_KEY,
       defaultEvmApiChain: EvmChain.GOERLI
   });
   app.listen(port,()=>{
       console.log(`Server running on Port: ${port}`)
   })
}

startServer();