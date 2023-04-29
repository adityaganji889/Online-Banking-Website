import React, {useEffect, useState, useRef} from 'react'
import PageTitle from '../../components/PageTitle'
import {message, Table, Form} from 'antd'
import TransferFundsModal from './TransferFundsModal';
import { useDispatch, useSelector } from 'react-redux';
import { getCreditTransactionsOfUser, getDebitTransactionsOfUser, getTransactionsOfUser } from '../../apicalls/transactions';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import moment from 'moment';
import DepositModal from './DepositModal';
import GeneratePDF from '../../components/GeneratePDF';
import { useReactToPrint } from 'react-to-print'

const Transactions = () => {
  const [showTransferFundsModal, setShowTransferFundsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [filterTitle, setFilterTitle] = useState("");
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [data=[],setData] = useState([]);
  const [SelectedOption,setSelectedOption] = useState("all");
  // let refer;
  const {user} = useSelector(state=>state.users);
  const dispatch = useDispatch();
  const getData = async() => {
     try{
       let response;
       dispatch(ShowLoading());
       if(SelectedOption==="all"){
        response = await getTransactionsOfUser();
        setFilterTitle("History of all your transactions");
       }
       else if(SelectedOption==="credit"){
        response = await getCreditTransactionsOfUser();
        setFilterTitle("History of all your credited transactions");
       }
       else if(SelectedOption==="debit"){
        response = await getDebitTransactionsOfUser();
        setFilterTitle("History of all your debited transactions");
       }
       if(response.success){
        setData(response.data);
       }
       dispatch(HideLoading());
     }
     catch(error){
       dispatch(HideLoading());
       message.error(error.message);
     }
  }
  useEffect(()=>{
    getData();
  },[])
  const columns = [
    {
        title: "Date",
        dataIndex: "date",
        render: (text,record) => {
            return moment(record.createdAt).format("DD-MM-YYYY hh:mm:ss A");
        }
    },
    {
        title: "Transaction ID",
        dataIndex: "_id",
    },
    {
        title: "Amount",
        dataIndex: "amount",
        render: (text,record) => {
          if(record.sender._id === user._id && record.reference!=="stripe deposit"){
            return (
              <div style={{color: "red"}}>
                - &#8377; {record.amount}
              </div>
            )
          }
          else{
            return (
              <div style={{color: "green"}}>
                + &#8377; {record.amount}
              </div>
            )
          }
        }
    },
    {
        title: "Type",
        dataIndex: "type",
        render: (text,record) => {
            return record.sender._id === user._id && record.reference!=="stripe deposit" ? "Debit" : "Credit"
        }
    },
    {
        title: "Reference Account",
        dataIndex: "",
        render: (text,record) => {
            return record.sender._id === user._id? <div>
                <h1 className='text-sm'>
                    {record.receiver.firstName} {record.receiver.lastName}
                </h1>
            </div> : <div>
                <h1 className='text-sm'>
                    {record.sender.firstName} {record.sender.lastName}
                </h1>
            </div>
        }
    },
    {
        title: "Reference",
        dataIndex: "reference",
    },
    {
        title: "Status",
        dataIndex: "status",
    },
  ]
  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: ()=>componentPDF.current,
    documentTitle: "Account Number : " + user._id + " " + filterTitle,
    onAfterPrint: ()=> { 
        message.success(`${filterTitle} is saved in a pdf successfully.`)
        setShowPDFModal(false);
    }
  })
  return (
    <div>
        <div className='flex justify-between items-center'>
        <PageTitle title="Transactions"/>
        <Form className='flex justify-between items-center gap-2'>
        <Form.Item label="Filter Transactions:" name="filteredTransactions" className='mt-35'>
                    <select value={SelectedOption} onChange={(e)=>setSelectedOption(e.target.value)}>
                    <option value="all">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    </select>
        </Form.Item>
        <button className='primary-contained-btn mt-1' type="button" onClick={()=>{
            getData();
         }}>
                Search
        </button>
        </Form>
        <div className='flex gap-1 mt-1'>
          <button className='primary-outline-btn' onClick={()=>setShowDepositModal(true)}>
            Deposit
          </button>
          <button className='primary-contained-btn' onClick={()=>setShowTransferFundsModal(true)}>
            Transfer
          </button>
          <div onClick={()=>{
            setShowPDFModal(true)
            if(showPDFModal){
              generatePDF();
            }
          }}>
          <button className='primary-outline-btn' type="button">
                Print PDF
          </button>
          </div>
        </div>
       </div>
       <Table columns={columns} dataSource={data} className='mt-2'/>
       {showTransferFundsModal && <TransferFundsModal showTransferFundsModal={showTransferFundsModal} setShowTransferFundsModal={setShowTransferFundsModal} reloadData={getData}/>}
       {showDepositModal && <DepositModal showDepositModal={showDepositModal} setShowDepositModal={setShowDepositModal} reloadData={getData}/>}
       {/* {showPDFModal && <GeneratePDF showPDFModal={showPDFModal} setShowPDFModal={setShowPDFModal} data={data} columns={columns} SelectedOption={SelectedOption} generatePDF={generatePDF} refer={refer} filterTitle={filterTitle} setFilterTitle={setFilterTitle}/>} */}
       {showPDFModal&&<div ref={componentPDF}>
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
       <Table columns={columns} dataSource={data} className='mt-2' pagination={false}/>
    </div>}
    </div>
  )
}

export default Transactions