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
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const verifyAccount = async() => {
     try{
       dispatch(ShowLoading())
       const response = await VerifyAccount({
        receiver: form.getFieldValue("receiver")
       })
       if(response.success){
        reloadData();
        setIsVerified(true);
        // setShowNewRequestModal(false);
        // message.success(response.message)
       }
       else{
        setIsVerified(false);
        // message.error(response.message)
       }
       dispatch(HideLoading())
     }
     catch(error){
       setIsVerified(false);
       message.error(error.message);
       dispatch(HideLoading());
     }
  }
  const onFinish = async(values) => {
       try{
        if(values.amount> user.balance){
            message.error("Insufficient Funds");
            return;
        }
         dispatch(ShowLoading())
         const payload = {
            ...values,
            sender: user._id,
            reference: values.reference || "no reference",
            status: "success",
         };
         const response = await SendRequest(payload);
         if(response.success){
            setShowNewRequestModal(false);
            message.success(response.message);
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
            <Form.Item label="Amount" name="amount" rules={[
                {
                    required: true,
                    message: "Please input your amount!",
                },
                {
                    max: user.balance,
                    message: "Insufficient Balance",
                }
            ]}>
                <input type="Number"/>
            </Form.Item>
            <Form.Item label="Description" name="description">
                <textarea type="text"/>
            </Form.Item>
            <div className='flex justify-end gap-1'>
            <button className='primary-outline-btn'>Cancel</button>
            {isVerified && <button className='primary-contained-btn'>Send Request</button>}
            </div>
        </Form>
        </Modal>
    </div>
  )
}

export default NewRequestModal