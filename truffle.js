let HDWalletProvider = require('truffle-hdwallet-provider')
let config = require('./config')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 4600000
    },
    ropsten: {
      provider: new HDWalletProvider(config.dev.env.MNEMONIC, 'https://ropsten.infura.io/'),
      network_id: 3,
      gas: 4600000
    }
  }
}
