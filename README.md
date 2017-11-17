# blockchain-prototype

> A simple blockchain prototype build with Web3 and VueJS
> Testing some very basic interaction with Smart Contracts

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```

On Windows you'll need to install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)

``` bash
# Install windows-build-tools from an elevated PowerShell or CMD.exe (run as Administrator).
npm install --global --production windows-build-tools
```

## Truffle

[Truffle Framework](http://truffleframework.com/) is used as Ethereum development framework.

``` bash
# Install Truffle
npm install -g truffle

# Compile the contracts
truffle compile

# Run the migrations
truffle migrate
```

## Running your own node

By default the prototype uses rinkeby test network, where the contract is deployed. (https://rinkeby.etherscan.io/address/0x12340385532F2c1da854326B09DE458fC20FfF33)

For testing on own node, set `useLocalNode`to true and update the contract `contracts/basicCrowdfunding.sol` address accordingly.

``` bash
# Starting rinkeby node from command line
geth --syncmode "fast" --rinkeby --rpc --rpccorsdomain="*" --ws --wsorigins="*" console  --rpcapi="db,eth,net,web3,personal,web3"

# Starting ropsten node from command line
geth --testnet --fast --bootnodes "enode://20c9ad97c081d63397d7b685a412227a40e23c8bdc6688c6f37e97cfbc22d2b4d1db1510d8f61e6a8866ad7f0e17c02b14182d37ea7c3c8b9c2683aeb6b733a1@52.169.14.227:30303,enode://6ce05930c72abc632c58e2e4324f7c7ea478cec0ed4fa2528982cf34483094e9cbc9216e7aa349691242576d552a2a56aaeae426c5303ded677ce455ba1acd9d@13.84.180.240:30303" --rpc --rpccorsdomain="*" --ws --wsorigins="*" --rpcapi="db,eth,net,web3,personal,web3"

# Running the project on testrpc

# Install testrpc
npm install -g ethereumjs-testrpc

# Run testrpc
testrpc

# Run testrpc with specific mnemonic (for metamask)
testrpc -m insert the mnemonic phrase from metamask here
# Import the given private keys in metamask

# Run ethereum wallet on own node (https://github.com/ethereum/mist/releases)
"/Applications/Ethereum Wallet.app/Contents/MacOS/Ethereum Wallet" --rpc http://localhost:8545
```