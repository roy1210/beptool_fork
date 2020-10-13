import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { FilePicker } from 'react-file-picker'
import { crypto } from '@binance-chain/javascript-sdk'
import base64js from 'base64-js'

import Breakpoint from 'react-socks';

import { Context } from '../../context'
import Binance from "../../clients/binance"
import { CHAIN_ID, NETWORK_ID } from '../../env'

import { Row, Icon as AntIcon, Col, Modal, Button as AntButton, Form, Input, message } from 'antd'
import { H1, Icon, Button, Center, Text, Coin, WalletAddress, WalletAddrShort} from "../Components"

const Transfer = (props) => {
  const { getFieldDecorator, getFieldError, isFieldTouched } = props.form;

  useEffect(() => {
    props.form.setFieldsValue({
      "ticker": props.ticker,
      "address": props.address,
      "free": props.free || 0,
    })
    // eslint-disable-next-line
  }, [props.ticker, props.address, props.free])

  // const context = useContext(Context)

  // Only show error after a field is touched.
  const addressError = isFieldTouched('address') && getFieldError('address');
  const freeError = isFieldTouched('free') && getFieldError('free');

  const onChange = () => {
    if (props.onChange) {
      let values = props.form.getFieldsValue()
      values.ticker = props.ticker
      values.free = parseFloat(values.free)
      props.onChange(props.index, values)
    }
  }

  return (
    <Row>
      <Col span={3}>
        <H1>{props.index + 1}.</H1>
      </Col>
      <Col>
        <Row>
          <Form layout="inline" onChange={onChange} onSubmit={props.handleSubmit}>
            <Col span={13}>
              <div><Text size={14}>Address</Text></div>
              <Form.Item className="form-100" style={{width: "100%"}} validateStatus={addressError ? 'error' : ''} help={addressError || ''}>
                {getFieldDecorator('address', {
                  rules: [{ required: true, message: 'Please input your address!' }],
                })(
                  <Input
                    style={{width: "100%"}}
                    placeholder="bnba1b2c3d4g5h6a1b2c3d4g5h6"
                  />,
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <div><Text size={14}>Amount</Text></div>
              <Form.Item className="form-100" style={{width: "100%"}} validateStatus={freeError ? 'error' : ''} help={freeError || ''}>
                {getFieldDecorator('free', {
                  rules: [{ required: true, message: 'Please input your free!' }],
                })(
                  <Input
                    style={{width: "100%"}}
                    placeholder="23.456"
                    addonAfter=<Text size={12}>{props.ticker}</Text>
                  />,
                )}
              </Form.Item>
            </Col>
          </Form>
        </Row>
      </Col>
    </Row>
  )
}
const WrappedTransferLine = Form.create()(Transfer);


const MultiSend = (props) => {
  const [transfers, setTransfers] = useState([{}])
  const [total, setTotal] = useState(0)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [balances, setBalances] = useState(null)
  const [loadingBalances, setLoadingBalancer] = useState(false)
  const [multiFee, setMultiFee] = useState(null)
  const [loadingCSV, setLoadingCSV] = useState(false)

  // confirmation modal variables
  const [visible, setVisible] = useState(false)
  const [password, setPassword] = useState(null)
  const [memo, setMemo] = useState("")
  const [sending, setSending] = useState(false)

  const context = useContext(Context)

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
    if (context.wallet && context.wallet.address) {
      setLoadingBalancer(true)
      Binance.getBalances(context.wallet.address)
        .then((response) => {
          const b = (response || []).map((bal) => (
            {
              "icon": "coin-bep",
              "ticker": bal.symbol,
              "free": parseFloat(bal.free),
            }
          ))
          setBalances([...b])
          setLoadingBalancer(false)
        })
        .catch((error) => {
          setLoadingBalancer(false)
        })
    }
    Binance.fees()
      .then((response) => {
        for (let msg of response.data) {
          if (msg.multi_transfer_fee) {
            setMultiFee(Binance.calculateFee(msg.multi_transfer_fee))
          }
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }, [context.wallet])

  var reader = new FileReader();
  reader.onload = () => {
    var text = reader.result;
    var transactions = []
    const lines = text.split(/\n/)
    for (let l of lines) {
      const parts = l.split(',')
      if (parts.length === 2) {
        transactions.push({
          "address": parts[0],
          "ticker": selectedCoin,
          "free": parseFloat(parts[1]) || 0,
        })
      } else {
        console.error("Invalid CSV line:", l)
      }
    }
    setTransfers([...transactions])
    setTotal(transactions.reduce((a,b) => a + (b.free || 0), 0))
    setLoadingCSV(false)
  }

  const addTransfer = (transfer) => {
    setTransfers([...transfers, {}])
  }

  const updateTransfer = (index, transfer) => {
    transfers[index] = transfer
    setTransfers(transfers)
    setTotal(transfers.reduce((a,b) => a + (b.free || 0), 0))
  }

  const confirmation = () => {
    setPassword("")
    setVisible(true)
  }

  const uploadCsv = (f) => {
    setLoadingCSV(true)
    reader.readAsText(f);
  }

  const handleOk = async () => {
    // Send coins!
    if (!context.wallet || !context.wallet.address) {
      setPassword(null) // clear password
      return
    }

    setSending(true)
    const binance = Binance

    const transactions = transfers.map((transfer) => (
      {
        "to": transfer.address,
        "coins": [{
          "denom": transfer.ticker,
          "amount": transfer.free,
        }]
      }
    ))

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
            memo:memo
          };

          // https://github.com/TrustWallet/wallet-core/blob/master/src/proto/Binance.proto#L46
          tx.send_order = {
            inputs: transfers.map((transfer) => {
              return {
                "address": base64js.fromByteArray(crypto.decodeAddress(context.wallet.address)),
                "coins": {
                  "denom": transfer.ticker,
                  "amount": transfer.free * Math.pow(10, 8),
                }
              }
            }),
            outputs: transfers.map((transfer) => {
              return {
                "address": base64js.fromByteArray(crypto.decodeAddress(transfer.address)),
                "coins": {
                  "denom": transfer.ticker,
                  "amount": transfer.free * Math.pow(10, 8),
                }
              }
            })
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

          context.wallet.walletconnect
            ._sendCallRequest(request)
            .then(result => {
              // Returns transaction signed in json or encoded format
              window.result = result
              console.log("Successfully signed msg:", result);
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
            password
          )
          binance.setPrivateKey(privateKey)

        } catch(err) {
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
        setPassword(null) // clear password
        const results = window.results = await Binance.multiSend(context.wallet.address, transactions, memo)
        setSending(false)
        if (results.result[0].ok) {
          const txURL = Binance.txURL(results.result[0].hash)
          message.success(<Text>Sent. <a target="_blank" rel="noopener noreferrer" href={txURL}>See transaction</a>.</Text>)
          setVisible(false)
        }
      } catch(err) {
        window.err = err
        console.error("Validating error:", err)
        message.error(err.message)
        setPassword(null) // clear password
        setSending(false)
      }
      // binance.clearPrivateKey()

    }

  }

  const handleCancel = () => {
    setPassword(null)
    setVisible(false)
  }

  const onPasswordChange = (e) => {
    const passwd = e.target.value
    setPassword(passwd)
  }


  // styling
  const coinRowStyle = {margin: "10px 0px"}

  return (

    <div style={{ marginTop: 20, marginLeft: 50 }}>
      <Row>

        <Col xs={24} sm={24} md={22} lg={20}>

          <div>
            <H1>Multi-Sending Tool</H1>
          </div>

          <div>
            <Text size={18}>
            Easily send transactions to multiple addresses using Binance Chain batched transactions feature.
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
          {!loadingBalances && context.wallet && (balances || []).length > 0 &&
          <Text>Select a coin below</Text>
          }
        </Row>

        {!loadingBalances && (balances || []).map((coin) => (
          <Row key={coin.ticker} style={coinRowStyle}>
            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
              <Coin {...coin} onClick={setSelectedCoin} border={selectedCoin === coin.ticker}/>
            </Col>
          </Row>
        ))
        }
      </div>
      {selectedCoin &&
      <Row>
        <Col xs={24} sm={24} md={24} lg={16}>
          {transfers.map((transfer, i) => (
            <WrappedTransferLine key={i} index={i} onChange={updateTransfer} ticker={selectedCoin} {...transfer} />
          ))
          }
          <Row style={{paddingRight: 5}}>
            <Col span={12}>
              <AntButton onClick={() => { addTransfer({})}} shape="circle" style={{border: "none", marginTop: 10}}>
                <Icon icon="plus" />
              </AntButton>
            </Col>
            <Col span={12}>
              <Row>
                <Col offset={12} span={3}>
                  <div style={{textAlign: "right"}}>
                    <div>
                      <Text size={14} bold>Total:</Text>
                    </div>
                    <div>
                      <Text size={14} bold>Fee:</Text>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div style={{textAlign: "right"}}>
                    <div>
                      <Text size={14} bold>{total}</Text> <Text size={14}>{selectedCoin}</Text>
                    </div>
                    <div>
                      <Text size={14} bold>{multiFee * transfers.length}</Text> <Text size={14}>BNB</Text>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <div style={{float: "right"}}>
                  <Button
                    disabled={transfers.length < 2}
                    onClick={confirmation}
                    loading={sending}
                    style={{padding: "0px 10px", fontSize: 14}} bold={true} fill={true}
                  >
                    Next <AntIcon type="arrow-right" />
                  </Button>
                </div>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8}>
          <Row style={coinRowStyle}>
            <Center>
              <H1>OR</H1>
            </Center>
          </Row>
          <Row style={coinRowStyle}>
            <Center>
              <Text>Upload a CSV file with in the following format:</Text>
            </Center>
          </Row>
          <Row style={coinRowStyle}>
            <Center>
              <Text bold>ADDRESS | AMOUNT</Text>
            </Center>
          </Row>
          <Row style={coinRowStyle}>
            <Center>
              <FilePicker
                extensions={['csv']}
                onChange={f => (uploadCsv(f))}
                onError={err => (console.error(err))}
              >
                <Button
                  style={{padding: "0px 20px", fontSize: 14}}
                  loading={loadingCSV}
                  bold={true}
                  fill={false}>
                  <AntIcon type="upload" /> Upload
                </Button>
              </FilePicker>
            </Center>
          </Row>
        </Col>
      </Row>

      }
      <Modal
        title="Confirmation"
        visible={visible}
        onOk={handleOk}
        okText={"Send Coins"}
        onCancel={handleCancel}
      >
        <div>
          Please verify and confirm addresses and amounts are EXACTLY correct!
          {transfers.map((item, i) => {
            return (
              <Row key={i} style={{margin: 20}}>
                <Text>{i+1}) {item.amount} {item.ticker} <AntIcon type="arrow-right" /> {item.address}</Text>
              </Row>
          )
          })
          }
          <div style={{margin: 20}}>
            <Input
              allowClear
              onChange={(e) => {setMemo(e.target.value || "")}}
              value={memo}
              placeholder="Enter your memo (optional)."
            />
          </div>
          {context.wallet && context.wallet.keystore && 
          <div style={{margin: 20}}>
            <Input.Password
              allowClear
              onChange={onPasswordChange}
              value={password}
              placeholder="Enter your password."
            />
          </div>
          }
        </div>
      </Modal>
    
      </Col>
        <Col xs={24} sm={24} md={1} lg={2}>
        </Col>
      </Row>
    </div>
)
}

export default MultiSend
