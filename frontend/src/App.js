import './App.css';
import './stylesheets/alignments.css'
import './stylesheets/custom-components.css'
import './stylesheets/form-elements.css'
import './stylesheets/text-elements.css'
import './stylesheets/theme.css'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Loader from './components/Loader';
import { useSelector } from 'react-redux';
import './stylesheets/layout.css'
import Transactions from './pages/Transactions';
import Requests from './pages/Requests';
import Users from './pages/users';
import { createClient, configureChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, goerli } from "wagmi/chains";
import { useEffect } from 'react';

 const { provider, webSocketProvider } = configureChains([goerli], [
  publicProvider(),
 ]);

 const client = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
 });

 function App() {
  const {loading} = useSelector(state=>state.loaders);
  const {user} = useSelector(state=>state.users)
  useEffect(()=>{
    
  },[user])  
  return (
      <div>
        {loading && <Loader/>}
        <WagmiConfig client={client}>
         <Router>
          <Routes>
           <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
           <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>
           <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
           <Route path="/transactions" element={<ProtectedRoute><Transactions/></ProtectedRoute>}/>
           <Route path="/requests" element={<ProtectedRoute><Requests/></ProtectedRoute>}/>
           <Route path="/users" element={<ProtectedRoute><Users/></ProtectedRoute>}/>
          </Routes>
         </Router>
        </WagmiConfig>
      </div>
  );
}

export default App;
