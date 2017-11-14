<template>
  <div>

    <section class="metamask-overlay" v-if="!isMetamaskInstalled">
      <h1>Please install metamask to get started!</h1>
    </section>

    <section class="metamask-overlay" v-if="!isLoggedIntoMetamask">
      <h1>Please login to metamask</h1>
    </section>

    <section class="metamask-wrong-network" v-if="!isConnectedToCorrectNetwork">
      <h1>Connected to wrong network</h1>
    </section>

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
      <header>{{ this.$store.state.crowdFundingContract.address }}</header>
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
import contract from 'truffle-contract'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

import contractStore from '../contractStore.js'

export default {
  name: 'Home',

  data () {
    return {
      requiredNetwork: ['private'],
      connectedNetwork: '',
      isLoggedIntoMetamask: false,
      accounts: [],
      account: null,
      fundAmountInEther: 0,
      wei: null
    }
  },

  computed: {
    isMetamaskInstalled () {
      return Web3.givenProvider !== null && Web3.givenProvider.isMetaMask === true
    },

    isConnectedToCorrectNetwork () {
      return this.requiredNetwork.includes(this.connectedNetwork)
    },

    ether () {
      return Web3.utils.fromWei(this.wei || 0, 'ether')
    },

    goal () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.goal.toNumber() || 0, 'ether')
    },

    value () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.value.toNumber() || 0, 'ether')
    },

    fundAmountInWei () {
      return Web3.utils.toWei(parseFloat(this.fundAmountInEther))
    }
  },

  created () {
    if (!this.isMetamaskInstalled) return

    window.web3 = new Web3(Web3.givenProvider)

    this.initialize()
  },

  methods: {
    initialize () {
      // Check if user is logged into metamask
      let a = window.web3.eth.getAccounts().then(this.storeUserAccounts)

      let b = window.web3.eth.net.getNetworkType().then((result) => {
        this.connectedNetwork = result

        if (!this.isConnectedToCorrectNetwork) {
          // Todo: Only repeat this part. But does the trick for now
          setTimeout(this.initialize, 1000)
          return Promise.reject('Is not connected to correct network')
        }

        return this.retrieveContractInformation()
      })

      Promise.all([a, b]).then(this.getUserBalances).catch((err) => {
        console.log(err)
      })
    },

    storeUserAccounts (accounts) {
      if (accounts.length === 0) {
        // Todo: Only repeat this part. But does the trick for now
        setTimeout(this.initialize, 1000)
        return Promise.reject('Is not logged in')
      }

      this.isLoggedIntoMetamask = true
      this.accounts = accounts
      this.account = accounts[0]

      this.$store.commit('setAccount')
      console.log('Got accounts')
      return Promise.resolve()
    },

    retrieveContractInformation () {
      let CrowdFundingContract = contract(CrowdFunding)
      CrowdFundingContract.setProvider(Web3.givenProvider)

      let SolarTokenContract = contract(SolarToken)
      SolarTokenContract.setProvider(Web3.givenProvider)

      let crowdFundingContract = CrowdFundingContract.deployed().then((instance) => {
        // Get all info from this contract
        contractStore.crowdFundingContract = instance
        this.$store.commit('setCrowdFundingContractAddress', instance.address)
        this._updateCrowdFundingContract()
      })

      let solarTokenContract = SolarTokenContract.deployed().then((instance) => {
        // Get all info from this contract
        contractStore.solarTokenContract = instance
        this.$store.commit('setSolarTokenContractAddress', instance.address)
        this._updateSolarTokenContract()
      })

      return Promise.all([crowdFundingContract, solarTokenContract])
    },

    getUserBalances () {
      window.web3.eth.getBalance(this.account).then((result) => {
        this.wei = result
      }).catch((error) => {
        console.log(error)
      })

      contractStore.crowdFundingContract.balanceOf.call(this.account, { from: this.account }).then((result) => {
        this.$store.commit('setCrowdFundingContractDeposit', result)
      })

      contractStore.solarTokenContract.balanceOf.call(this.account, { from: this.account }).then((result) => {
        this.$store.commit('setSolarTokenShare', result)
      })
    },

    fundOneEther () {
      contractStore.crowdFundingContract.contribute({
        from: this.account,
        to: contractStore.crowdFundingContract.address,
        value: this.fundAmountInWei
      }).then((result) => {
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    withdrawAll () {
      contractStore.crowdFundingContract.withdraw({
        from: this.account
      }).then((result) => {
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    _updateCrowdFundingContract () {
      this.$store.dispatch('updateCrowdFundingContractInformation')
    },

    _updateSolarTokenContract () {
      this.$store.dispatch('updateSolarTokenContractInformation')
    }
  }
}
</script>

<style scoped>

</style>
