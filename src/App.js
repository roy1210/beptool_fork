import React from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from 'antd';

import { ContextProvider } from "./context"
import { BreakpointProvider } from 'react-socks';

import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'

import Home from './components/pages/Home'
import Fees from './components/pages/Fees'
import MultiSend from './components/pages/MultiSend'
import Freezer from './components/pages/Freezer'
//import MultiSig from './components/pages/MultiSig'
//import Escrow from './components/pages/Escrow'
//import HEscrow from './components/pages/HedgeEscrow'
//import DAO from './components/pages/DAO'
import Unlock from './components/pages/Wallet/Unlock'
import Wallet from './components/pages/Wallet/index'

import 'antd/dist/antd.css'
import './App.css'

const { Content } = Layout;

const App = (props) => {
  return (
    <ContextProvider>
      <Router>
        <div>
        <BreakpointProvider>
          <Layout>
            <Header />
            <Layout style={{height:"100vh"}}>
              <Sidebar />
              <Content style={{background: "#F8F9FA"}}>
                <Switch>
                  <Route path="/" exact component={Home} />
                  <Route path="/fees" exact component={Fees} />
                  <Route path="/multi-send" exact component={MultiSend} />
                  <Route path="/freezer" exact component={Freezer} />
                  <Route path="/wallet" exact component={Wallet} />
                  <Route path="/wallet/unlock" exact component={Unlock} />
                </Switch>
              </Content>
            </Layout>
          </Layout>
          </BreakpointProvider>
        </div>
      </Router>
    </ContextProvider>
  );
}

export default App;
