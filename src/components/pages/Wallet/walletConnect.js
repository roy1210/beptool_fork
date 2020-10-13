import React, { useContext } from 'react'
import WalletConnect from "@walletconnect/client";
// import WalletConnect from "@trustwallet/walletconnect";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

import { Text, Button } from '../../Components'
import { Icon as AntIcon, Row, Col } from 'antd'

import { Context } from '../../../context'
import { crypto } from '@binance-chain/javascript-sdk'


const WalletConnectPane = props => {

  const context = useContext(Context)

  const walletConnect = async () => {
    const walletConnector = window.mywallet = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: WalletConnectQRCodeModal,
    });



    // Check if connection is already established
    if (!walletConnector.connected) {
      console.log("Creating session")
      // create new session
      walletConnector.createSession().then(() => {
        // get uri for QR Code modal
        const uri = walletConnector.uri;
        // display QR Code modal
        WalletConnectQRCodeModal.open(uri, () => {
          console.log("QR Code Modal closed");
        })
      })
    } else {
      walletConnector.killSession()
    }

    // Subscribe to connection events
    walletConnector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Close QR Code Modal
      // WalletConnectQRCodeModal.close();

      // Get provided accounts and chainId
      // const { accounts, chainId } = payload.params[0];

        const request = walletConnector._formatRequest({
        method: "get_accounts",
      });

      walletConnector._sendCallRequest(request).then(result => {
        // Returns the accounts
        const account = result.find((account) => account.network === 714);
        console.log("ACCOUNT:", account)
        console.log("WALLET CONNECT ACCOUNTS RESULTS " + account.address);
        console.log("ADDR:", crypto.decodeAddress(account.address))
        context.setContext({
          "wallet": {
            "walletconnect": walletConnector,
            "address": account.address,
            "account": account,
          }
        }, () => {
          WalletConnectQRCodeModal.close()
          props.history.push("/")
        })
      })
        .catch(error => {
          // Error returned when rejected
          console.error(error);
        })
    })

    walletConnector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      // const { accounts, chainId } = payload.params[0];
    })

    walletConnector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Delete walletConnector
      context.forgetWallet()
    })

  }


  const paneStyle = {
    backgroundColor: "#F0B90B",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "50px",
    borderRadius: 5,
    boxShadow: "0px 0px 5px #F0B90B",
  }

  return (
    <div>

      <Row  style={{bottom: 5}}>
        <Text size={18}>Click to scan a QR code and link your mobile wallet using WalletConnect.</Text>
      </Row>

      <Row>
      <Col span={12}>

        <Button
                onClick={() => walletConnect()}
                fill={true}
                style={{marginTop:24, marginLeft:0}}
              >
                Connect <AntIcon type="arrow-right" />
              </Button>
              </Col>

      </Row>

    </div>
  )
}

export default WalletConnectPane
