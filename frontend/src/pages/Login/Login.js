import React, { useEffect } from 'react'
import {useNavigate} from 'react-router-dom';
import {Form, Row, Col, message} from 'antd';
import { LoginUser } from '../../apicalls/users';
import { useSelector, useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import axios from 'axios';

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // const {user} = useSelector(state=>state.users)
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const handleAuth = async (values) => {
    //disconnects the web3 provider if it's already active
    if (isConnected) {
      await disconnectAsync();
    }
    // enabling the web3 provider metamask
    const { account, chain } = await connectAsync({
      connector: new InjectedConnector({
        options: {
          shimDisconnect: true,
          UNSTABLE_shimOnConnectSelectAccount: true,
        },
      }),
    });

    const userData = { address: account, chain: chain.id };
    // making a post request to our 'request-message' endpoint
    const { data } = await axios.post(
      `/api/users/request-message`,
      userData,
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
    console.log("data:",data)
    const message = data.message;
    // signing the received message via metamask
    const signature = await signMessageAsync({ message });
    // console.log(signature)
    const response = await axios.post(
      `/api/users/verify`,
      {
        message,
        signature,
        values,
      },
      { withCredentials: true } // set cookie from Express server
    );
    console.log("user's:",response.data)
    // redirect to /user
    return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message
    }
  };
  const onFinish = async(values) => {
    try{
      dispatch(ShowLoading());
      const response = await handleAuth(values);
      dispatch(HideLoading());
      if(response.success){
        message.success(response.message);
        localStorage.setItem("token",response.data);
        window.location.href="/";
      }
      else{
        message.error(response.message);
      }
    }
    catch(error){
      dispatch(HideLoading());
      message.error(error.message);
    }
  }
  return (
    <div className='bg-primary flex items-center justify-center h-screen'>
    <div className='card w-400 p-3'>
    <div className='flex items-center justify-between'>
    <h1 className='text-2xl'>Online Banking System - Login</h1>
    </div>
    <hr/>
        <Form layout='vertical' onFinish={onFinish}>
            <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="email" name="email">
                    <input type="email" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Password" name="password">
                    <input type="password"/>
                  </Form.Item>
                </Col>
            </Row>
            <div className='flex justify-end'>
              <button className='primary-contained-btn w-screen' type="submit">Login</button>
            </div>
        </Form>
        <h1 className='text-sm underline mt-2' onClick={()=>navigate('/register')}>
           Not a Member? Register Here
        </h1>
    </div>
    </div>
  )
}

export default Login