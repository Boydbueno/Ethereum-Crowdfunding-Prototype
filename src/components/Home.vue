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
        {{ account }}
        <canvas ref="qrcode"></canvas>
      </header>
      Ether: {{ balance }} <br />
    </section>

    <section class="contract">
      <header>{{ crowdFundingContractAddress }}</header>
      <section class="info">
        Goal: {{ goal }} ETH<br />
        Value: {{ value }} ETH<br />
        Participants: {{ crowdFundingContract.participantsCount }}
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
import QRCode from 'qrcode'
import contract from 'truffle-contract'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

import contractStore from '../contractStore.js'

export default {
  name: 'Home',

  data () {
    return {
      requiredNetwork: ['private', 'ropsten'],
      connectedNetwork: '',
      isLoggedIntoMetamask: false,
      fundAmountInEther: 0
    }
  },

  computed: {
    account () {
      return this.$store.state.account
    },

    wei () {
      return this.$store.state.wei
    },

    crowdFundingContract () {
      return this.$store.state.crowdFundingContract
    },

    balance () {
      return Web3.utils.fromWei(this.wei || 0, 'ether')
    },

    crowdFundingContractAddress () {
      return this.$store.state.crowdFundingContract.address
    },

    isMetamaskInstalled () {
      return Web3.givenProvider !== null && Web3.givenProvider.isMetaMask === true
    },

    isConnectedToCorrectNetwork () {
      return this.requiredNetwork.includes(this.connectedNetwork)
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

  mounted () {
    if (!this.isMetamaskInstalled) return

    window.web3 = new Web3(Web3.givenProvider)

    this.$watch('account', newAccount => {
      QRCode.toCanvas(this.$refs.qrcode, newAccount, (err) => {
        if (err) console.log(err)
      })
    })

    // We keep polling for balance changes
    // We cannot use events because of Web3 1.0
    setInterval(() => {
      this.getAccounts().then(this.getAccountBalance)
    }, 1000)

    this.initialize()
  },

  methods: {
    initialize () {
      // Check if user is logged into metamask
      let a = this.getAccounts()

      let b = window.web3.eth.net.getNetworkType().then(result => {
        this.connectedNetwork = result

        if (!this.isConnectedToCorrectNetwork) {
          // Todo: Only repeat this part. But does the trick for now
          setTimeout(this.initialize, 1000)
          return Promise.reject('Is not connected to correct network')
        }

        return this.retrieveContractInformation()
      })

      Promise.all([a, b]).then(this.getUserBalances).catch(error => {
        console.log(error)
      })
    },

    storeUserAccounts (accounts) {
      if (accounts.length === 0) {
        // Todo: Only repeat this part. But does the trick for now
        setTimeout(this.initialize, 1000)
        return Promise.reject('Is not logged in')
      }

      this.isLoggedIntoMetamask = true

      if (this.$store.state.account !== accounts[0]) {
        this.$store.commit('setAccount', accounts[0])
      }

      return Promise.resolve()
    },

    retrieveContractInformation () {
      let CrowdFundingContract = contract(CrowdFunding)
      CrowdFundingContract.setProvider(Web3.givenProvider)

      let SolarTokenContract = contract(SolarToken)
      SolarTokenContract.setProvider(Web3.givenProvider)

      let crowdFundingContract = CrowdFundingContract.deployed().then(instance => {
        // Get all info from this contract
        contractStore.crowdFundingContract = instance
        this.$store.commit('setCrowdFundingContractAddress', instance.address)
        this._updateCrowdFundingContract()
      })

      let solarTokenContract = SolarTokenContract.deployed().then(instance => {
        // Get all info from this contract
        contractStore.solarTokenContract = instance
        this.$store.commit('setSolarTokenContractAddress', instance.address)
        this._updateSolarTokenContract()
      })

      return Promise.all([crowdFundingContract, solarTokenContract])
    },

    getUserBalances () {
      this.getAccountBalance()

      contractStore.crowdFundingContract.balanceOf.call(this.account, { from: this.account }).then(result => {
        this.$store.commit('setCrowdFundingContractDeposit', result)
      })

      contractStore.solarTokenContract.balanceOf.call(this.account, { from: this.account }).then(result => {
        this.$store.commit('setSolarTokenShare', result)
      })
    },

    fundOneEther () {
      contractStore.crowdFundingContract.contribute({
        from: this.account,
        to: contractStore.crowdFundingContract.address,
        value: this.fundAmountInWei
      }).then((result) => {
        this.$store.commit('increaseCrowdFundingValue', { wei: this.fundAmountInWei })
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
    },

    getAccounts () {
      return window.web3.eth.getAccounts().then(this.storeUserAccounts)
    },

    getAccountBalance () {
      if (this.account === '') return

      return window.web3.eth.getBalance(this.account).then(result => {
        if (this.wei === result) return

        this.$store.commit('setWei', result)
      }).catch((error) => {
        console.log(error)
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
