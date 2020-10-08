const prod_hostnames = [
  "beptools.org",
  "binancetools-prod.firebaseapp.com",
  "binancetools-prod.web.app",
  "localhost",
]

const isMainnet = prod_hostnames.includes(window.location.hostname)
const isTestnet = !isMainnet
const CHAIN_ID = isTestnet ? "Binance-Chain-Nile" : "Binance-Chain-Tigris"
const NETWORK_ID = 714

const NET = isTestnet ? "testnet" : "mainnet"

export {
  NET,
  CHAIN_ID,
  NETWORK_ID,
  isTestnet,
  isMainnet,
}
