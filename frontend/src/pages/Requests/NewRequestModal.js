import React,{useState} from 'react'
import {Modal, Form, message} from 'antd'
import { useDispatch, useSelector } from 'react-redux';
import { TransferFunds, VerifyAccount } from '../../apicalls/transactions';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import { SendRequest } from '../../apicalls/requests';

function NewRequestModal({showNewRequestModal,setShowNewRequestModal,reloadData}) {
  const handleCancel = () => {
        setShowNewRequestModal(false);
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
       dispatch(HideLoading())
       if(response.success){
        // reloadData();
        setIsVerified(true);
        setRecipientUser(response.data.walletAddress);
        // setShowNewRequestModal(false);
        message.success(response.message)
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
        if(Number(values.amount)> user.balance){
            message.error("Insufficient Funds");
            return;
        }
         const payload = {
            amount: Number(values.amount),
            receiver: values.receiver,
            sender: user._id,
            senderWalletAddress: user.walletAddress,
            receiverWalletAddress: recipientUser,
            reference: values.description || "no reference",
            status: "pending",
         };
         dispatch(ShowLoading())
         const response = await SendRequest(payload);
         dispatch(HideLoading())
         if(response.success){
            reloadData();
            setShowNewRequestModal(false);
            message.success(response.message);
         }
       }
       catch(error){
         dispatch(HideLoading())
         message.error(error.message)
       }
  }
  return (
    <div>
        <Modal title="Request Funds" open={showNewRequestModal} onCancel={handleCancel} footer={null}>
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
            <Form.Item label="Description" name="description">
                <textarea type="text"/>
            </Form.Item>
            <div className='flex justify-end gap-1'>
            <button className='primary-outline-btn' onClick={()=>setShowNewRequestModal(false)}>Cancel</button>
            {isVerified && <button className='primary-contained-btn' type="submit">Send Request</button>}
            </div>
        </Form>
        </Modal>
    </div>
  )
}

export default NewRequestModal