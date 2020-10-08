import React, { useContext } from 'react'
import { Link } from "react-router-dom"
import { Layout, Row, Col } from 'antd';

import Breakpoint from 'react-socks';

import { Context } from '../../context'

import { Icon, Button, WalletAddrShort } from '../Components'

const Header = (props) => {

  const context = useContext(Context)

  return (
    <Layout.Header className="header-container">
      <Row>
      <Col xs={4}>
      <Link to="/">
        <Icon icon="logo" />
      </Link>
      </Col>
      <Col xs={16}>
      </Col>
      
        <Col xs={4}>
        <Breakpoint medium up>
        {context.wallet ?
        <Link to="/wallet"><WalletAddrShort /></Link>
            :
            <Link to="/wallet/unlock">
              <Button fill>
                Connect my Wallet
              </Button>
            </Link>
        }
              </Breakpoint>
      </Col>

      </Row>
    </Layout.Header>
  )
}

export default Header
