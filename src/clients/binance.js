import bnbClient from '@binance-chain/javascript-sdk'
import TokenManagement from '@binance-chain/javascript-sdk'
import { crypto, tx } from '@binance-chain/javascript-sdk'
import axios from 'axios'

import { NET, isTestnet} from '../env'

class Binance {
  constructor() {
    this.baseURL = "https://dex.binance.org"
    this.explorerBaseURL = "https://explorer.binance.org"

    if (isTestnet) {
      this.baseURL = "https://testnet-dex.binance.org"
      this.explorerBaseURL = "https://testnet-explorer.binance.org"
    }

    this.net = NET
    console.log("Net:", this.net)

    this.httpClient = axios.create({
      baseURL:  this.baseURL + "/api/v1",
      contentType: "application/json",
    })

    this.bnbClient = new bnbClient(this.baseURL);
    this.bnbClient.chooseNetwork(this.net)
    this.bnbClient.initChain()
    this.bnbTokens = new TokenManagement(this.bnbClient).tokens;
  }

  setPrivateKey(privateKey) {
    this.bnbClient.setPrivateKey(privateKey)
    this.bnbClient.chooseNetwork(this.net)
    this.bnbClient.initChain()
  }

  useLedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb, hdPath) {
    return this.bnbClient.useLedgerSigningDelegate(ledgerApp, preSignCb, postSignCb, errCb, hdPath)
  }

  clearPrivateKey() {
    this.bnbClient.privateKey = null
  }

  getPrefix() {
    return isTestnet ? "tbnb" : "bnb"
  }

  txURL(tx) {
    return this.explorerBaseURL + "/tx/" + tx
  }

  fees() {
    return this.httpClient.get("/fees")
  }

  time() {
    return this.httpClient.get("/time")
  }

  validators() {
    return this.httpClient.get("/validators")
  }

  nodeInfo() {
    return this.httpClient.get("/node-info")
  }

  peers() {
    return this.httpClient.get("/peers]")
  }

  genesis(){
    return "Apr-18-2019 15:59:26"
  }

  // convert fee number into BNB tokens
  calculateFee(x) {
    return  x / 100000000
  }

  async getPrice() {
    const bnb = await axios.get("https://api.cryptonator.com/api/ticker/bnb-usd")
    return parseFloat(bnb.data.ticker.price)
  }

  getBalances(address) {
    return this.bnbClient.getBalance(address)
  }

  getAccount(address) {
    return this.bnbClient.getAccount(address)
  }

  getMarkets(limit = 1000, offset = 0) {
    return this.bnbClient.getMarkets(limit, offset)
  }

  async multiSend(address, transactions, memo="") {
    // send coins!
    const result = await this.bnbClient.multiSend(address, transactions, memo)
    return result
  }

  async lock(fromAddr, symbol, amount) {

    const fromAddress = crypto.decodeAddress(fromAddr)

    console.log("fromAddress", fromAddress)

    const lockMsg = {
      from: fromAddr,
      symbol,
      amount,
      msgType: "TimeLockMsg"
    }
    console.log("lockMsg", lockMsg)

    const lockSignMsg = {
      amount: amount,
      from: fromAddr,
      symbol
    }

    console.log("lockSignMsg", lockSignMsg)

    const signedTx = await this.bnbClient._prepareTransaction(lockMsg, lockSignMsg, fromAddr)

    console.log("signedtx", signedTx)

    return this.bnbClient._broadcastDelegate(signedTx)
  }
}

var binance = window.binance = new Binance()
export default binance
