<template>
  <div>

    <metamask-guidance></metamask-guidance>

    <i-row type="flex" justify="center">
      <i-col><account :is-loading="!$store.state.isLoggedIntoMetaMask"></account></i-col>
    </i-row>

    <i-row type="flex" justify="center">
      <i-col span="16"><project :is-loading="!$store.getters.isConnectedToCorrectNetwork"></project></i-col>
    </i-row>

    <i-row type="flex" justify="center">
      <i-col span="12"><pending-transactions></pending-transactions></i-col>
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
import PendingTxs from '@/components/PendingTxs'
import Project from '@/components/Project'
import Account from '@/components/Account'
import { Row, Col, Message } from 'iview'

export default {
  name: 'Home',

  components: {
    'metamask-guidance': MetaMaskGuidance,
    'pending-transactions': PendingTxs,
    'account': Account,
    'project': Project,
    'i-row': Row,
    'i-col': Col
  },

  data () {
    return {
      fundAmountInEther: '0'
    }
  },

  computed: {
    ...mapState([
      'isLoggedIntoMetaMask',
      'pendingTxs',
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

        if (!this.isConnectedToCorrectNetwork) {
          return
        }

        this.retrieveContractInformation()
      })
    },

    accountPolling () {
      this.getAccounts().then(accounts => {
        if (accounts.length <= 0) {
          if (!this.isLoggedIntoMetaMask) return

          this.$store.commit('setIsLoggedIntoMetaMask', false)
          return
        }

        if (!this.isLoggedIntoMetaMask) {
          this.$store.commit('setIsLoggedIntoMetaMask', true)
        }

        this.storeUserAccounts(accounts)

        return this.getAccountBalance().then(result => {
          if (this.wei === result) return

          this.$store.commit('setWei', result)
        })
      })

      setTimeout(this.accountPolling, 2000)
    },

    getAccounts () {
      return window.web3.eth.getAccounts()
    },

    getAccountBalance () {
      return window.web3.eth.getBalance(this.account)
    },

    storeUserAccounts (accounts) {
      if (this.$store.state.account === accounts[0]) return

      this.$store.commit('setAccount', accounts[0])
    },

    retrieveContractInformation () {
      let CrowdFundingContract = contract(CrowdFunding)
      CrowdFundingContract.setProvider(Web3.givenProvider)

      let SolarTokenContract = contract(SolarToken)
      SolarTokenContract.setProvider(Web3.givenProvider)

      let crowdFundingContract = CrowdFundingContract.deployed().then(instance => {
        let event = instance.allEvents({fromBlock: 0, toBlock: 'latest'})

        event.watch((error, log) => {
          if (error) console.error(error)

          let correspondingPendingTx = this.pendingTxs.find(obj => obj.hash === log.transactionHash)
          if (correspondingPendingTx) {
            this.$store.commit('removePendingTx', { txHash: log.transactionHash })
            Message.destroy()
            Message.success('De transactie is geslaagd!')

            this._updateCrowdFundingContract()
          }
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
  .ivu-tooltip-inner {
    max-width: 400px !important;
  }

  a {
    color: white !important;
    text-decoration: underline !important;
  }
</style>
