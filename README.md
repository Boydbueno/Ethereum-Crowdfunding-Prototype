# Ethereum Crowdfunding Prototype
> A prototype built with Web3.js, Truffle Framework and VueJS, running on the Ropsten Test Network.  
> Crowdfunding on the Ethereum blockchain.

## Demo

> You'll be prompted by the UI to install MetaMask. This is required to connect to the Ethereum network.  
> The prototype is built for Google Chrome, but FireFox should also work fine.

[Ethereum Crowdfunding Prototype](https://boydbueno.github.io/blockchain-prototype/)

## Developing

### Frontend
> For working on the frontend it's only required to install npm dependencies and serve the application.  
> Connect your [MetaMask](https://metamask.io/) with the Ropsten Test Network.

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification 
npm run build 
```

On Windows you'll need to install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) before running `npm install`

``` bash
# Install windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator).
npm install --global --production windows-build-tools
```

### Smart Contracts
> If you wish to work on the Smart Contracts it's recommended to run your own node.  
> [Ganache](http://truffleframework.com/ganache/) is a tool to easily run your own node.

Make sure to set the port to `8545` in Ganache or change the port in `truffle.js` to correspond with your development node.

For deploying smart contracts [Truffle Framework](http://truffleframework.com/) is used.

``` bash
# Install Truffle
npm install -g truffle

# Compile the contracts
truffle compile

# Run the migrations on your local node
truffle migrate

# Run the migrations on the ropsten test network (make sure you have set your mnemonic in config.secret.js)
truffle migrate --network ropsten
```

Before deploying to the Ropsten test network:
1. Rename `config/secret.js.example` to `config.secret.js`
2. Add your mnemonic in here if you're planning on deploying to the Ropsten test network.