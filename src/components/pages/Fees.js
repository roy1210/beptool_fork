import React, { useState, useEffect, } from "react"

import Binance from "../../clients/binance"

import { Row, Col } from 'antd'
import { H1, Text} from "../Components"


const Fees = (props) => {

  const [feeSP, setFeeSP] = useState(null)
  const [feeD, setFeeD] = useState(null)
  const [feeV, setFeeV] = useState(null)
  const [feeCV, setFeeCV] = useState(null)
  const [feeRV, setFeeRV] = useState(null)
  const [feeDL, setFeeDL] = useState(null)
  const [feeON, setFeeON] = useState(null)
  const [feeOC, setFeeOC] = useState(null)
  const [feeIM, setFeeIM] = useState(null)
  const [feeMM, setFeeMM] = useState(null)
  const [feeTB, setFeeTB] = useState(null)
  const [feeTF, setFeeTF] = useState(null)
  const [feeTL, setFeeTL] = useState(null)
  const [feeTU, setFeeTU] = useState(null)
  const [feeTR, setFeeTR] = useState(null)
  const [feeSAF, setFeeSAF] = useState(null)

  const [feeFFP, setFeeFFP] = useState(null)
  const [feeMTF, setFeeMTF] = useState(null)

  const [feeEF, setFeeEF] = useState(null)
  const [feeEFN, setFeeEFN] = useState(null)
  const [feeCF, setFeeCF] = useState(null)
  const [feeCFN, setFeeCFN] = useState(null)
  const [feeFR, setFeeFR] = useState(null)
  const [feeFRN, setFeeFRN] = useState(null)
  const [feeIEF, setFeeIEF] = useState(null)
  const [feeIEFN, setFeeIEFN] = useState(null)

  const [price, setPrice] = useState(null)

  useEffect(() => {

    Binance.getPrice().then((response) => {
      setPrice(response)
    })

    Binance.fees()
        .then((response) => {


          response.data.forEach(e => {
            switch (e.msg_type) {
              case "submit_proposal": setFeeSP(Binance.calculateFee(e.fee)); break;
              case "deposit": setFeeD(Binance.calculateFee(e.fee)); break;
              case "vote": setFeeV(Binance.calculateFee(e.fee)); break;
              case "create_validator": setFeeCV(Binance.calculateFee(e.fee)); break;
              case "remove_validator": setFeeRV(Binance.calculateFee(e.fee)); break;
              case "dexList": setFeeDL(Binance.calculateFee(e.fee)); break;
              case "orderNew": setFeeON(Binance.calculateFee(e.fee)); break;
              case "orderCancel": setFeeOC(Binance.calculateFee(e.fee)); break;
              case "issueMsg": setFeeIM(Binance.calculateFee(e.fee)); break;
              case "mintMsg": setFeeMM(Binance.calculateFee(e.fee)); break;
              case "tokensBurn": setFeeTB(Binance.calculateFee(e.fee)); break;
              case "tokensFreeze": setFeeTF(Binance.calculateFee(e.fee)); break;
              case "timeLock": setFeeTL(Binance.calculateFee(e.fee)); break;
              case "timeUnlock": setFeeTU(Binance.calculateFee(e.fee)); break;
              case "timeRelock": setFeeTR(Binance.calculateFee(e.fee)); break;
              case "setAccountFlags": setFeeSAF(Binance.calculateFee(e.fee)); break;
              default:
                break;
            }
          });
            
            setFeeFFP(Binance.calculateFee(response.data.filter(e => e.fixed_fee_params)[0].fixed_fee_params.fee))
            setFeeMTF(Binance.calculateFee(response.data.filter(e => e.fixed_fee_params)[0].multi_transfer_fee))
            
            var arrayField = response.data.filter(e => e.dex_fee_fields)

            arrayField[0].dex_fee_fields.forEach(e => {
              switch (e.fee_name) {
                case "ExpireFee": setFeeEF(Binance.calculateFee(e.fee_value)); break;
                case "ExpireFeeNative": setFeeEFN(Binance.calculateFee(e.fee_value)); break;
                case "CancelFee": setFeeCF(Binance.calculateFee(e.fee_value)); break;
                case "CancelFeeNative": setFeeCFN(Binance.calculateFee(e.fee_value)); break;
                case "FeeRate": setFeeFR(Binance.calculateFee(e.fee_value)); break;
                case "FeeRateNative": setFeeFRN(Binance.calculateFee(e.fee_value)); break;
                case "IOCExpireFee": setFeeIEF(Binance.calculateFee(e.fee_value)); break;
                case "IOCExpireFeeNative": setFeeIEFN(Binance.calculateFee(e.fee_value)); break;
                default:
                 break;
                }
            })
        })
  }, [])
  
  return (
    <div style={{margin: 20, marginLeft:50}}>

    <H1>FEES</H1>
    <br>
    </br>
    <Text></Text>
    <Text size={18}>
    Binance Chain Mainnet Fees
    </Text>

    <Row style={{marginTop:"40px"}}>
      <h2>Transaction Fees</h2>
      <hr></hr>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Single Transaction</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeFFP}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeFFP * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Single Batched Transaction</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeMTF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeMTF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >100 Batched Transactions</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeMTF*100}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeMTF*100 * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >1000 Batched Transactions</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeMTF*1000}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeMTF*1000 * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>

    <Row style={{marginTop:"40px"}}>
      <h2>Asset Fees</h2>
      <hr></hr>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Issue Asset</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeIM}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeIM * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Mint Asset</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeMM}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeMM * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Freeze Asset</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeTF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeTF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Burn Asset</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeTB}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeTB * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>
    <Row style={{marginTop:"20px"}}>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Time Lock</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeTL}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeTL * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Time Unlock</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeTU}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeTU * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Time Relock</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeTR}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeTR * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Set Account Flags</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeSAF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeSAF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>



    <Row style={{marginTop:"40px"}}>
      <h2>Binance DEX Fees</h2>
      <hr></hr>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >New Order</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeON}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeON * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Cancel Order</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeOC}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeOC * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>

    <Row>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Fee Rate (Native)</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeFRN}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeFRN * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Cancel Fee (Native)</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeCFN}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeCFN * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Expire Fee (Native)</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeEFN}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeEFN * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >IOC Expire Fee (Native)</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeIEFN}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeIEFN * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>

    <Row style={{marginTop:"20px"}}>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Fee Rate</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeFR}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeFR * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Cancel Fee</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeCF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeCF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Expire Fee</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeEF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeEF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >IOC Expire Fee</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeIEF}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeIEF * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>


    <Row style={{marginTop:"40px"}}>
      <h2>Governance Fees</h2>
      <hr></hr>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Submit Proposal</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeSP}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeSP * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Vote</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeV}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeV * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Deposit</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeD}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeD * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >List on DEX</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeDL}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeDL * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>

    </Row>
    <Row style={{marginTop:"20px"}}>
      <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Create Validator</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeCV}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeCV * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Text bold="true" >Remove Validator</Text>
      <br></br>
      <span><Text color="#F0B90B" size="40px">{feeRV}</Text></span><span><Text color="#F0B90B" size="20px"> BNB</Text></span>
      <br></br>
      <span><Text size="40px">{(feeRV * price).toFixed(2)}</Text></span><span><Text size="20px"> USD</Text></span>
    </Col>
    </Row>





      </div>
  )
}

export default Fees
