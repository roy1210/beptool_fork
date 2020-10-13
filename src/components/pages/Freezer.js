import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import TokenManagement, { crypto } from '@binance-chain/javascript-sdk'
import base64js from 'base64-js'

import Breakpoint from 'react-socks';

import { Context } from '../../context'
import Binance from "../../clients/binance"
import { CHAIN_ID } from '../../env'
import { Row, Form, Col, Modal, Input, message } from 'antd'
import { H1, Button, Text, Coin, WalletAddress, WalletAddrShort } from "../Components"


// RUNE-B1A
const NETWORK_ID = 714
const MODE_FREEZE = "FREEZE"
const MODE_UNFREEZE = "UNFREEZE"

const Freezer = (props) => {
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [balances, setBalances] = useState(null)
  const [mode, setMode] = useState("stake")
  const [loadingBalances, setLoadingBalancer] = useState(false)
  const [fee, setFee] = useState(null)

  // confirmation modal variables
  const [visible, setVisible] = useState(false)
  const [sending, setSending] = useState(false)
  const context = useContext(Context)


  const getFee = () => {
    Binance.fees()
      .then((response) => {
        const fee = response.data.find((item) => {
          return item.msg_type === "tokensFreeze"
        })
        setFee(Binance.calculateFee(fee.fee))
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const getBalances = () => {
    if (context.wallet && context.wallet.address) {
      setLoadingBalancer(true)
      Binance.getBalances(context.wallet.address)
        .then((response) => {
          console.log("Balances:", response)
          const b = (response || []).map((bal) => (
            {
              "icon": "coin-bep",
              "ticker": bal.symbol,
              "free": parseFloat(bal.free),
              "frozen": parseFloat(bal.frozen),
              "locked": parseFloat(bal.locked),
            }
          ))
          setBalances([...b])
          setLoadingBalancer(false)
        })
        .catch((error) => {
          setLoadingBalancer(false)
        })
    }
  }

  useEffect(() => {
    getFee()
  }, [])

  useEffect(() => {
    if (context.wallet && context.wallet.address) {
      setLoadingBalancer(true)
      Binance.getBalances(context.wallet.address)
        .then((response) => {
          console.log("Balances:", response)
          const b = (response || []).map((bal) => (
            {
              "icon": "coin-bep",
              "ticker": bal.symbol,
              "free": parseFloat(bal.free),
              "frozen": parseFloat(bal.frozen),
              "locked": parseFloat(bal.locked),
            }
          ))
          setBalances([...b])
          setLoadingBalancer(false)
        })
        .catch((error) => {
          setLoadingBalancer(false)
        })
    }
  }, [context.wallet])

  const confirmation = (mode) => {

    const bnb = balances.find((b) => {
      return b.ticker === "BNB"
    }) || { free: 0 }
    if (fee > bnb.free) {
      message.error("Insufficient fund: Not enough for transaction fee of " + fee + "BNB", 10)
      return
    }
    setMode(mode)
    setVisible(true)
  }

  const handleOk = async (values) => {
    // Send coins!
    if (!context.wallet || !context.wallet.address) {
      console.log("No wallet detected!")
      return
    }

    setSending(true)
    const binance = Binance

    // setup binance client for authentication
    if (context.wallet.walletconnect) {
      Binance.getAccount(context.wallet.address)
        .then((response) => {
          const account = response.result
          console.log("AccountInfo:", account)
          const tx = window.tx = {
            accountNumber: account.account_number.toString(),
            chainId: CHAIN_ID,
            sequence: account.sequence.toString(),
          };

          if (mode === MODE_FREEZE) {
            tx.freeze_order = {
              from: base64js.fromByteArray(crypto.decodeAddress(context.wallet.address)),
              symbol: selectedCoin,
              amount: (parseFloat(values.amount) * Math.pow(10, 8)).toString(),
            }
          } else if (mode === MODE_UNFREEZE) {
            tx.unfreeze_order = {
              from: base64js.fromByteArray(crypto.decodeAddress(context.wallet.address)),
              symbol: selectedCoin,
              amount: (parseFloat(values.amount) * Math.pow(10, 8)).toString(),
            }
          } else {
            throw new Error("invalid mode")
          }
          const request = context.wallet.walletconnect._formatRequest({
            method: "trust_signTransaction",
            params: [
              {
                NETWORK_ID,
                transaction: JSON.stringify(tx),
              },
            ],
          });
          console.log("request", request);
          // debugger
          window.mywall = context.wallet.walletconnect
          context.wallet.walletconnect
            ._sendCallRequest(request)
            .then(result => {
              // Returns transaction signed in json or encoded format
              window.result = result
              console.log("Successfully signed freeze/unfreeze msg:", result);
              binance.bnbClient.sendRawTransaction(result, true)
                .then((response) => {
                  console.log("Response", response)
                  setSending(false)
                  setVisible(false)
                  getBalances()
                })
                .catch((error) => {
                  message.error(error.message)
                  setSending(false)
                  setVisible(false)
                  console.error(error)
                })
            })
            .catch(error => {
              // Error returned when rejected
              console.error(error);
              message.error(error.message)
              setSending(false)
              setVisible(false)
            });
          return
        })
        .catch((error) => {
          window.err = error
          message.error(error.message)
          setSending(false)
          setVisible(false)
          console.error(error)
          return
        })
    } else {

      if (context.wallet.keystore) {
        try {
          const privateKey = crypto.getPrivateKeyFromKeyStore(
            context.wallet.keystore,
            values.password
          )
          binance.setPrivateKey(privateKey)

        } catch (err) {
          window.err = err
          console.error("Validating keystore error:", err)
          message.error(err.message)
          setSending(false)
          return
        }

      } else if (context.wallet.ledger) {
        binance.useLedgerSigningDelegate(
          context.wallet.ledger,
          null, null, null,
          context.wallet.hdPath,
        )
      } else {
        throw new Error("no wallet detected")
      }

      try {
        const manager = new TokenManagement(Binance.bnbClient).tokens
        var results
        if (mode === MODE_FREEZE) {
          results = await manager.freeze(context.wallet.address, selectedCoin, values.amount)
        } else if (mode === MODE_UNFREEZE) {
          results = await manager.unfreeze(context.wallet.address, selectedCoin, values.amount)
        } else {
          throw new Error("invalid mode")
        }
        setSending(false)
        if (results.result[0].ok) {
          const txURL = Binance.txURL(results.result[0].hash)
          message.success(<Text>Sent. <a target="_blank" rel="noopener noreferrer" href={txURL}>See transaction</a>.</Text>, 10)
          setVisible(false)
          getBalances()
        }
      } catch (err) {
        window.err = err
        console.error("Staking error:", err)
        message.error(err.message)
        setSending(false)
      }
      // binance.clearPrivateKey()
    }
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const passwordRequired = context.wallet && 'keystore' in context.wallet

  var balance = 0

  // if (balances) {
  //   balance = AmounttoString((balances || []).find((b) => {
  //     return b.ticker === selectedCoin
  //   }).free +
  //     balances.find((b) => {
  //       return b.ticker === selectedCoin
  //     }).frozen
  //   )
  // }

  // styling
  const coinRowStyle = {
    margin: "10px 0px",
    marginLeft: "10px",
    marginRight: "10px",
    marginTop: "20px",
  }

  const paneStyle = {
    backgroundColor: "#ededed",
    marginRight: "20px",
    marginTop: "20px",
    borderRadius: 5,
  }

  return (
    <div style={{ marginTop: 20, marginLeft: 50 }}>
      <Row>
        <Col xs={24} sm={24} md={22} lg={20}>
          <div>
            <H1>Token Freezer</H1>
          </div>
          <div>
            <Text size={18}>
              Freeze and unfreeze tokens easily using the Binance Chain Freeze/Unfreeze function.
          </Text>
          </div>
          <div style={{ marginTop: "20px" }}>

            <Breakpoint small down>
              {!loadingBalances && context.wallet &&
                <Row>
                  <Col xs={24} sm={24} md={12} style={{ marginTop: "20px" }}>
                    <a target="_blank" rel="noopener noreferrer" href={"https://explorer.binance.org/address/" + context.wallet.address}>
                      <WalletAddrShort />
                    </a>
                  </Col>
                </Row>
              }
            </Breakpoint>

            <Breakpoint medium up>
              {!loadingBalances && context.wallet &&
                <Row>
                  <Col xs={24} sm={24} md={12} style={{ marginTop: "20px" }}>
                    <a target="_blank" rel="noopener noreferrer" href={"https://explorer.binance.org/address/" + context.wallet.address}>
                      <WalletAddress />
                    </a>
                  </Col>
                </Row>
              }
            </Breakpoint>

            <Row style={{ marginTop: "40px" }}>
              {loadingBalances && context.wallet &&
                <Text><i>Loading balances, please wait...</i></Text>
              }

              {!context.wallet &&
                <Link to="/wallet/unlock"><Button fill>CONNECT WALLET</Button></Link>
              }

              {!loadingBalances && context.wallet && (balances || []).length === 0 &&
                <Text>No coins available</Text>
              }
            </Row>

            <Row>
              <Col xs={24}>

                {!loadingBalances && context.wallet && (balances || []).length > 0 &&
                  <Row style={{ marginBottom: "50px" }}>
                    <Col xs={24} sm={6} style={paneStyle}>
                      <Row style={{ marginTop: "10px", marginLeft: "10px" }}>
                        <Col xs={24} style={{ paddingRight: "10px" }}>
                          <Text size={18}>SELECT TOKEN BELOW</Text>
                          <hr />
                        </Col>
                      </Row>

                      {!loadingBalances && (balances || []).map((coin) => (
                        <Row key={coin.ticker} style={coinRowStyle}>
                          <Col xs={24}>
                            <Coin {...coin} onClick={setSelectedCoin} border={selectedCoin === coin.ticker} />
                          </Col>
                        </Row>
                      ))
                      }
                    </Col>

                    <Col xs={24} sm={16} style={{
                      backgroundColor: "#ededed",
                      marginTop: "20px",
                      borderRadius: 5,
                    }}>

                      {selectedCoin &&
                        <Row style={{ marginTop: "10px", marginLeft: "10px", marginRight: "10px", marginBottom: "10px" }}>
                          <Col xs={24}>
                            <Row>
                              <Col xs={24}>
                                <Text size={18}>FREEZE OR UNFREEZE BELOW</Text>
                                <hr />
                                <Row>
                                  <Col xs={12} style={{ marginTop: "10px" }}>
                                    <span>
                                      <Text>TOTAL BALANCE:</Text>
                                    </span>
                                    <span style={{ margin: "0px 20px" }} size={22}>
                                      {balance}</span>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={24}>
                                <Row>
                                  <Col xs={24} sm={12}>
                                    <Row>
                                      <Col>
                                        <span>
                                          <Text>FREE:</Text>
                                        </span>
                                        <span style={{ margin: "0px 20px" }} size={22}>{balances.find((b) => {
                                          return b.ticker === selectedCoin
                                        }).free}
                                        </span>
                                      </Col>
                                    </Row>
                                    <Row>
                                      <Col>
                                        <Button fill
                                          style={{ height: 40, width: 200, marginTop: 10 }}
                                          onClick={() => { confirmation('FREEZE') }}
                                          loading={sending}
                                        >
                                          FREEZE
                                        </Button>
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col xs={24} sm={12}>
                                    <Row>
                                      <Col>
                                        <span>
                                          <Text>FROZEN:</Text>
                                        </span>
                                        <span style={{ margin: "0px 20px" }} size={22}>{balances.find((b) => {
                                          return b.ticker === selectedCoin
                                        }).frozen}
                                        </span>
                                      </Col>
                                    </Row>

                                    <Row>
                                      <Col>
                                        <Button fill
                                          style={{ height: 40, width: 200, marginTop: 10 }}
                                          onClick={() => { confirmation('UNFREEZE') }}
                                          loading={sending}
                                        >
                                          UNFREEZE
                                        </Button>
                                        <br></br>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      }
                    </Col>
                  </Row>
                }
              </Col>
            </Row>
          </div>

          <Modal
            title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            visible={visible}
            footer={null}
            onCancel={handleCancel}
            bodyStyle={{ backgroundColor: "#fff", paddingBottom: 0 }}
            headStyle={{ backgroundColor: "#2B3947", color: "#fff" }}
          >
            <WrappedFreezeForm fee={fee} password={passwordRequired} button={mode} onSubmit={handleOk} onCancel={handleCancel} loading={sending} />
          </Modal>
        </Col>
        <Col xs={24} sm={24} md={1} lg={2}>
        </Col>
      </Row>
    </div>
  )
}

const FreezeForm = (props) => {

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        if (props.onSubmit) {
          props.onSubmit(values)
        }
        props.form.resetFields()
      }
    });
  };

  const { getFieldDecorator } = props.form;

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <Form.Item >
        {getFieldDecorator('amount', {
          rules: [{ required: true, message: 'Please input an amount of tokens!' }],
        })(
          <Input
            placeholder="Amount: ie 1.9938"
          />,
        )}
      </Form.Item>
      {props.password &&
        <Form.Item >
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              type="password"
              placeholder="Password"
            />,
          )}
        </Form.Item>
      }
      <Form.Item>
        <div style={{ float: "right" }}>
          <Button onClick={props.onCancel} >Cancel</Button>
          <Button fill
            type="primary"
            htmlType="submit"
            onClick={handleSubmit}
            loading={props.loading}
            style={{ marginLeft: 10 }}
          >
            {props.button.charAt(0).toUpperCase() + props.button.slice(1)}
          </Button>
          <div style={{ padding: 0, margin: 0 }}>
            <Text style={{ float: "right" }} size={12} color="#EE5366">Network Fee: {props.fee} BNB</Text>
          </div>
        </div>
      </Form.Item>
    </Form>
  );
}

const WrappedFreezeForm = Form.create({ name: 'freeze' })(FreezeForm);

export default Freezer
