<template>
  <div>

    <section class="account">
      <header>
        <select v-if="accounts.length > 1" v-model="account">
          <option v-for="account in accounts" :value="account">
            {{ account }}
          </option>
        </select>
        <template v-else>{{ account }}</template>
      </header>
      Ether: {{ ether }} <br />
    </section>

    <section class="contract">
      <header>{{ contractProps.address }}</header>
      <section class="info">
        Goal: {{ goal }} ETH<br />
        Value: {{ value }} ETH<br />
      </section>

      <section class="actions">
        <input type="number" v-model="fundAmountInEther" name="fundAmount" min="0.1" step="0.1">
        <input type="button" name="fund" value="Fund" @click="fundOneEther">
      </section>
    </section>

  </div>
</template>

<script>
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import contract from 'truffle-contract'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

export default {
  name: 'Home',

  data () {
    return {
      useLocalNode: false,
      accounts: [],
      account: null,
      fundAmountInEther: 0,
      wei: null,
      contractProps: {
        address: '',
        goal: new BigNumber(0),
        value: new BigNumber(0)
      }
      // contract, reactivity breaks assignment
    }
  },

  computed: {
    ether () {
      return window.web3.utils.fromWei(this.wei || 0, 'ether')
    },

    goal () {
      return window.web3.utils.fromWei(this.contractProps.goal.toNumber() || 0, 'ether')
    },

    value () {
      return window.web3.utils.fromWei(this.contractProps.value.toNumber() || 0, 'ether')
    },

    fundAmountInWei () {
      return window.web3.utils.toWei(parseFloat(this.fundAmountInEther))
    }
  },

  created () {
    let CrowdFundingContract = contract(CrowdFunding)
    CrowdFundingContract.setProvider(Web3.givenProvider)

    let SolarTokenContract = contract(SolarToken)
    SolarTokenContract.setProvider(Web3.givenProvider)

    if (Web3.givenProvider && !this.useLocalNode) {
      window.web3 = new Web3(Web3.givenProvider)
      console.log('Given provider', Web3.givenProvider)
    } else {
      window.web3 = new Web3('ws://localhost:8546')
      console.log('Connected to own node')
    }

    CrowdFundingContract.deployed().then((instance) => {
      console.log(instance)
      this.contract = instance
      this.contractProps.address = this.contract.address

      window.web3.eth.getAccounts().then((accounts) => {
        this.accounts = accounts
        this.account = accounts[0]

        return window.web3.eth.getBalance(this.account)
      }).then((result) => {
        this.wei = result
      }).catch((error) => {
        console.log(error)
      })

      this.web3Contract = new window.web3.eth.Contract(CrowdFunding.abi, this.contract.address)

      this._updateContract()
    })

    SolarTokenContract.deployed().then((instance) => {
      console.log(instance)
    })
  },

  methods: {

    fundOneEther () {
      // window.web3.eth.sendTransaction({
      //   from: this.account,
      //   to: this.contract.address,
      //   value: this.fundAmountInWei
      // }, (error, result) => {
      //   if (error) console.log(error)
      //   console.log(result)
      // }).on('transactionHash', (hash) => {
      //   console.log(hash)
      // }).on('receipt', (receipt) => {
      //   console.log(receipt)
      // }).on('confirmation', (number, object) => {
      //   console.log(number)
      //   console.log(object)
      // }).on('error', (error) => {
      //   console.error(error)
      // })

      this.contract.contribute({
        from: this.account,
        to: this.contract.address,
        value: this.fundAmountInWei
      }).then((result) => {
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    withdrawAll () {
      this.contract.withdraw({
        from: this.account
      }).then((result) => {
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    _updateContract () {
      this.contract.goal.call().then((result) => {
        this.contractProps.goal = result
      })

      this.contract.value.call().then((result) => {
        this.contractProps.value = result
      })
    }

  }
}
</script>

<style scoped>

</style>
