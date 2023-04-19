import React,{useState,useEffect} from 'react'
import {message} from 'antd'
import { getUserInfo } from '../apicalls/users';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SetUser, ReloadUser } from '../redux/usersSlice';
import { HideLoading, ShowLoading } from '../redux/loadersSlice';
import DefaultLayout from './DefaultLayout';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';

function ProtectedRoute(props) {
    const navigate = useNavigate();
    // const [userData, setUserData] = useState('');
    const {user,reloadUser} = useSelector((state)=>state.users)
    const dispatch = useDispatch();
    const { isConnected, isDisconnected } = useAccount();
    const getData = async() => {
      try{
          dispatch(ShowLoading())
          const response = await getUserInfo();
          dispatch(HideLoading())
          if(response.success){
              dispatch(SetUser(response.data));
          }
          else{
            message.error(response.message);
            navigate('/login')
          }
          dispatch(ReloadUser(false))
      }
      catch(error){
          dispatch(HideLoading())
          message.error(error.message);
          navigate('/login');
      }
    }
    async function initialise() {
      const {ethereum} = window;
      const accounts = await ethereum.request({method: 'eth_accounts'});
      return accounts && accounts.length > 0;
    }
    useEffect(()=>{
    if(localStorage.getItem('token')){
        if(!user){
            getData();
        }
    }
    },[isDisconnected])
    useEffect(()=>{
       if(reloadUser){
        getData()
       }
       else if(isDisconnected){
        localStorage.removeItem("token");
        navigate('/login');
       }
       else{
        window.ethereum.on('accountsChanged', async () => {
          initialise();
          localStorage.removeItem("token");
          navigate('/login');
        });
       }
    },[reloadUser,isDisconnected])
  return (
    user && <div>
    <DefaultLayout>{props.children}</DefaultLayout>
</div>
  )
}

export default ProtectedRoute