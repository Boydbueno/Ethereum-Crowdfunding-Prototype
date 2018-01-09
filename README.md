# Ethereum Prototype

> An Ethereum prototype build with Web3.js, Truffle and VueJS.
> Testing some basic interactions with Smart Contracts

## Demo

[Prototype](https://boydbueno.github.io/blockchain-prototype/)

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification 
npm run build 
 
# build for production and view the bundle analyzer report 
npm run build --report 
```

On Windows you'll need to install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)

``` bash
# Install windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator).
npm install --global --production windows-build-tools
```

Rename `config/secret.js.example` to `config.secret.js`. Add your mnemonic in here if you're planning on deploying to the Ropsten test network.

### Truffle

[Truffle Framework](http://truffleframework.com/) is used as Ethereum development framework.

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

### Ganache

[Ganache](http://truffleframework.com/ganache/) is recommended as development node.

Make sure to set the port to `8545` in Ganache or change the port in `truffle.js` to correspond with your development node.