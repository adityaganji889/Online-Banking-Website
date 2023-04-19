import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Table, message } from 'antd';
import PageTitle from './PageTitle';

const GeneratePDF = ({data, columns, showPDFModal, setShowPDFModal, SelectedOption, refer, filterTitle, setFilterTitle, generatePDF}) => {
  const {user} = useSelector(state=>state.users)
  const componentPDF = useRef();
  useEffect(()=>{
    if(SelectedOption==="all"){
        setFilterTitle("History of all your transactions");
    }
    else if(SelectedOption==="credit"){
        setFilterTitle("History of all your credited transactions");
    }
    else if(SelectedOption==="debit"){
        setFilterTitle("History of all your debited transactions");
    }
    console.log(componentPDF.current);
    refer = componentPDF.current;
    generatePDF();
  },[])
  return (
    <div ref={componentPDF}>
        <div className='flex justify-between items-center'>
         <PageTitle title={filterTitle}/>
         <div>
          <div>Account Holder Name : {user.firstName} {user.LastName}</div>
          <div>Account Number : {user._id}</div>
          <div>Email : {user.email}</div>
          <div>Phone Number : {user.phoneNumber}</div>
          <div>Current Balance : &#8377; {user.balance}</div>
          <div>Address : {user.address}</div>
         </div>
        </div>
       <Table columns={columns} dataSource={data} className='mt-2'/>
    </div>
  )
}

export default GeneratePDF