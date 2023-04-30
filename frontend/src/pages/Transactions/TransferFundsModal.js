import React,{useState} from 'react'
import {Modal, Form, message} from 'antd'
import { useDispatch, useSelector } from 'react-redux';
import { TransferFunds, VerifyAccount } from '../../apicalls/transactions';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { ReloadUser } from '../../redux/usersSlice';
import { ethers } from 'ethers';

function TransferFundsModal({showTransferFundsModal,setShowTransferFundsModal,reloadData}) {
  const handleCancel = () => {
        setShowTransferFundsModal(false);
  };
  const {user} = useSelector(state=>state.users);
  const [isVerified, setIsVerified] = useState();
  const [recipientUser,setRecipientUser] = useState("");
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const verifyAccount = async() => {
     try{
       dispatch(ShowLoading())
       const response = await VerifyAccount({
        receiver: form.getFieldValue("receiver")
       })
       console.log(response);
       dispatch(HideLoading())
       if(response.success){
        // reloadData();
        setIsVerified(true);
        setRecipientUser(response.data.walletAddress);
        // setShowTransferFundsModal(false);
        message.success(response.message);
       }
       else{
        setIsVerified(false);
        message.error(response.message)
       }
     }
     catch(error){
       dispatch(HideLoading());
       setIsVerified(false);
       message.error(error.message);
     }
  }
  const onFinish = async(values) => {
       try{
         dispatch(ShowLoading())
         let ether = values.amount
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const signer = provider.getSigner();
         ethers.utils.getAddress(recipientUser);
         const tx = await signer.sendTransaction({
          to: recipientUser,
          value: ethers.utils.parseEther(ether)
         });
         const payload = {
          amount: values.amount,
          sender: user._id,
          receiver: values.receiver,
          reference: values.reference || "no reference",
          status: tx.hash!==""?"success":"failed",
          senderWalletAddress: tx.from!==""?tx.from:"",
          receiverWalletAddress: tx.to!==""?tx.to:"",
          transactionHash: tx.hash!==""?tx.hash:""
         };
         const response = await TransferFunds(payload);
         if(response.success){
            reloadData()
            setShowTransferFundsModal(false);
            message.success(response.message);
            dispatch(ReloadUser(true))
         }
         dispatch(HideLoading())
       }
       catch(error){
         dispatch(HideLoading())
         message.error(error.message)
       }
  }
  return (
    <div>
        <Modal title="Transfer Funds" open={showTransferFundsModal} onCancel={handleCancel} footer={null}>
        <Form layout='vertical' form={form} onFinish={onFinish}>
            <div className='flex gap-2 items-center'>
            <Form.Item label="Account Number" name="receiver" className='w-100'>
                <input type="text"/>
            </Form.Item>
            <button className='primary-contained-btn mt-1' type="button" onClick={verifyAccount}>
                VERIFY
            </button>
            </div>
            {isVerified===true && <div className='success-bg'>
                Account Verified Successfully.
            </div>}
            {isVerified===false && <div className='error-bg'>
                Invalid Account.
            </div>}
            <Form.Item label="Wallet Address" name="walletAddress" shouldUpdate={true}>
               {recipientUser!==""?recipientUser:"------------------------------------------------------------------------------------"}
            </Form.Item>
            <Form.Item label="Amount" name="amount" rules={[
                {
                    required: true,
                    message: "Please input your amount!",
                },
                // {
                //     max: user.balance,
                //     message: "Insufficient Balance",
                // }
            ]}>
                <input type="text"/>
            </Form.Item>
            <Form.Item label="Reference" name="reference">
                <textarea type="text"/>
            </Form.Item>
            <div className='flex justify-end gap-1'>
            <button className='primary-outline-btn' onClick={()=>setShowTransferFundsModal(false)}>Cancel</button>
            {isVerified && <button className='primary-contained-btn' type="submit">Transfer</button>}
            </div>
        </Form>
        </Modal>
    </div>
  )
}

export default TransferFundsModal