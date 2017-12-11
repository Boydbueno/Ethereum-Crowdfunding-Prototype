let HDWalletProvider = require('truffle-hdwallet-provider')
let secret = require('./config/secret.js')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 4600000
    },
    ropsten: {
      provider: new HDWalletProvider(secret.MNEMONIC, 'https://ropsten.infura.io/'),
      network_id: 3,
      gas: 4600000
    }
  }
}
