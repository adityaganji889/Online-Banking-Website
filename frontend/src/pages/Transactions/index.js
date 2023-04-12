import React, {useEffect, useState} from 'react'
import PageTitle from '../../components/PageTitle'
import {message, Table, Form} from 'antd'
import TransferFundsModal from './TransferFundsModal';
import { useDispatch, useSelector } from 'react-redux';
import { getCreditTransactionsOfUser, getDebitTransactionsOfUser, getTransactionsOfUser } from '../../apicalls/transactions';
import { HideLoading, ShowLoading } from '../../redux/loadersSlice';
import moment from 'moment';
import DepositModal from './DepositModal';

function Transactions() {
  const [showTransferFundsModal, setShowTransferFundsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [data=[],setData] = useState([]);
  const [SelectedOption,setSelectedOption] = useState("all");
  const {user} = useSelector(state=>state.users);
  const dispatch = useDispatch();
  const getData = async() => {
     try{
       let response;
       dispatch(ShowLoading());
       if(SelectedOption==="all"){
        response = await getTransactionsOfUser();
       }
       else if(SelectedOption==="credit"){
        response = await getCreditTransactionsOfUser();
       }
       else if(SelectedOption==="debit"){
        response = await getDebitTransactionsOfUser();
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
        <div className='flex gap-1'>
          <button className='primary-outline-btn' onClick={()=>setShowDepositModal(true)}>
            Deposit
          </button>
          <button className='primary-contained-btn' onClick={()=>setShowTransferFundsModal(true)}>
            Transfer
          </button>
        </div>
       </div>
       <Table columns={columns} dataSource={data} className='mt-2'/>
       {showTransferFundsModal && <TransferFundsModal showTransferFundsModal={showTransferFundsModal} setShowTransferFundsModal={setShowTransferFundsModal} reloadData={getData}/>}
       {showDepositModal && <DepositModal showDepositModal={showDepositModal} setShowDepositModal={setShowDepositModal} reloadData={getData}/>}
    </div>
  )
}

export default Transactions