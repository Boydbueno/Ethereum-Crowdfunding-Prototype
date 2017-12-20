import Web3 from 'web3'

export default {
  isInstalled () {
    return Web3.givenProvider !== null && Web3.givenProvider.isMetaMask === true
  }
}
