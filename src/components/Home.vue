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
        Beneficiary: {{ contractProps.beneficiary }} <br />
        Goal: {{ contractProps.goal.toNumber() }} <br />
        Value: {{ contractProps.value.toNumber() }} <br />
      </section>

      <section class="actions">
        <input type="button" name="fund" value="fund 0.01 ether" @click="fundOneEther">
        <input type="button" name="withdraw" value="withdraw all your ether" @click="withdrawAll">
        <input type="button" name="claim" value="claim all ether" @click="claim">
      </section>
    </section>

  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import BigNumber from 'bignumber.js'

import BasicCrowdFundingArtifacts from '../../build/contracts/BasicCrowdFunding.json'

export default {
  name: 'Home',

  data () {
    return {
      useLocalNode: false,
      accounts: [],
      account: null,
      wei: null,
      contractProps: {
        beneficiary: 0,
        goal: new BigNumber(0),
        value: new BigNumber(0),
        address: 0
      }
      // contract, reactivity breaks assignment
    }
  },

  computed: {
    ether () {
      return window.web3.utils.fromWei(this.wei || 0, 'ether')
    }
  },

  created () {
    let BasicCrowdFunding = contract(BasicCrowdFundingArtifacts)
    BasicCrowdFunding.setProvider(Web3.givenProvider)

    if (Web3.givenProvider && !this.useLocalNode) {
      window.web3 = new Web3(Web3.givenProvider)
      console.log('Given provider', Web3.givenProvider)
    } else {
      window.web3 = new Web3('ws://localhost:8546')
      console.log('Connected to own node')
    }

    BasicCrowdFunding.deployed().then((instance) => {
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

      this.web3Contract = new window.web3.eth.Contract(BasicCrowdFundingArtifacts.abi, this.contract.address)

      this._updateContract()
    })
  },

  methods: {

    fundOneEther () {
      window.web3.eth.sendTransaction({
        from: this.account,
        to: this.contract.address,
        value: '10000000000000000'
      }).on('transactionHash', (hash) => {
        console.log(hash)
      }).on('receipt', (receipt) => {
        console.log(receipt)
      }).on('confirmation', (number, object) => {
        console.log(number)
        console.log(object)
      }).on('error', (error) => {
        console.log(error)
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

    claim () {
      this.contract.claim({
        from: this.account
      }).then((result) => {
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    _updateContract () {
      this.contract.beneficiary.call().then((result) => {
        this.contractProps.beneficiary = result
      })

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
