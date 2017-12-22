<template>
  <div>

    <metamask-guidance></metamask-guidance>

    <i-row type="flex" justify="center">
      <account v-if="$store.state.isLoggedIntoMetaMask"></account>
    </i-row>

    <i-row type="flex" justify="center">
      <project v-if="$store.getters.isConnectedToCorrectNetwork"></project>
    </i-row>

  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import { mapState, mapGetters } from 'vuex'

import MetaMaskService from '@/services/MetaMaskService'
import contractStore from '@/contractStore'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

import MetaMaskGuidance from '@/components/MetaMaskGuidance'
import Project from '@/components/Project'
import Account from '@/components/Account'
import { Row } from 'iview'

export default {
  name: 'Home',

  components: {
    'metamask-guidance': MetaMaskGuidance,
    'account': Account,
    'project': Project,
    'i-row': Row
  },

  data () {
    return {
      isLoggedIntoMetamask: false,
      fundAmountInEther: '0'
    }
  },

  computed: {
    ...mapState([
      'isLoggedIntoMetaMask',
      'account',
      'wei'
    ]),

    ...mapGetters([
      'isConnectedToCorrectNetwork'
    ])
  },

  mounted () {
    if (!MetaMaskService.isInstalled()) return

    window.web3 = new Web3(Web3.givenProvider)

    this.initialize()
  },

  methods: {
    initialize () {
      this.accountPolling()

      window.web3.eth.net.getNetworkType().then(result => {
        this.$store.commit('setConnectedNetwork', result)

        if (!this.isConnectedToCorrectNetwork) return

        this.retrieveContractInformation()
      })

      // Todo: Retrieve user coins
      // Todo: Show all previous transactions
    },

    accountPolling () {
      this.getAccounts().then(accounts => {
        if (accounts.length === 0) {
          if (!this.isLoggedIntoMetaMask) return

          this.$store.commit('setIsLoggedIntoMetaMask', false)
          return
        }

        this.storeUserAccounts(accounts).then(this.getAccountBalance)

        if (this.isLoggedIntoMetaMask) return

        this.$store.commit('setIsLoggedIntoMetaMask', true)
      })

      setTimeout(this.accountPolling, 2000)
    },

    getAccounts () {
      return window.web3.eth.getAccounts()
    },

    getAccountBalance () {
      if (this.account === '') return

      window.web3.eth.getBalance(this.account).then(result => {
        if (this.wei === result) return

        this.$store.commit('setWei', result)
      }).catch((error) => {
        console.log(error)
      })
    },

    storeUserAccounts (accounts) {
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
        const event = instance.allEvents({fromBlock: 0, toBlock: 'latest'})

        event.watch((err, log) => {
          if (err) console.error(err)

          // Here we need to check if this transaction is a transaction from the user
          // If it is, we can destroy the loading message and display a new one with a success message.
          // Todo: check for someone else's transaction
          // Message.destroy()
          // Message.success('De transactie is geslaagd!')
          console.log(log)
        })

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
      this.getAccountBalance().catch(error => {
        console.log(error)
      })

      contractStore.crowdFundingContract.balanceOf.call(this.account, { from: this.account }).then(result => {
        this.$store.commit('setCrowdFundingContractDeposit', result)
      })

      contractStore.solarTokenContract.balanceOf.call(this.account, { from: this.account }).then(result => {
        this.$store.commit('setSolarTokenShare', result)
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

<style lang="scss">
  .contract {
    width: 750px;

    img {
      width: 100%;
    }
  }

  .stat {
    .stat-number {
      display: block;
      font-size: 20px;
      margin-bottom: -5px;
    }
  }

  .ivu-tooltip-inner {
    max-width: 400px !important;
  }

  a {
    color: white !important;
    text-decoration: underline !important;
  }
</style>
