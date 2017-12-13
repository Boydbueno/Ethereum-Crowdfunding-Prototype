<template>
  <div>
    <overlay :isVisible="shouldShowInstallMetamaskPrompt" title="Install metamask to get started">
      <p>
        To make use of this application, please install the <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank">MetaMask Chrome extension</a> or <a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/" target="_blank">FireFox addon</a>.
      </p>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/6Gf_kRE4MJU?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
      <p>
        After installation, please <a class="refresh" href="#" @click="refresh">refresh this page</a>.
      </p>
    </overlay>

    <overlay :isVisible="shouldShowLoginMetaMaskPrompt" title="Please login to metamask">
      <p>
        Follow the instructions after clicking the MetaMask icon.
      </p>
      <img src="../assets/images/metamaskExtension.jpg" />
    </overlay>

    <overlay :isVisible="shouldShowConnectNetworkMetaMaskPrompt" title="Connected to the wrong network">
      <p>
        You're currently connected to {{ connectedNetworkLabel }}, please connect to {{ requiredNetworkLabel }} by using the network selection in MetaMask.
      </p>
      <img src="../assets/images/metamaskNetworkSelection.png" />
    </overlay>

    <account></account>

    <section class="contract">
      <header>
        <h1>Zonnepanelen Maassilo Rotterdam</h1>
      </header>
      <section class="info">
        <div>Address: {{ crowdFundingContractAddress }}</div>
        Goal: {{ goal }} ETH<br />
        Value: {{ value }} ETH<br />
        <progress :value="value" :max="goal" />
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
import contract from 'truffle-contract'

import config from '../config'
import contractStore from '../contractStore'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

import Overlay from '@/components/Overlay'
import Account from '@/components/Account'

export default {
  name: 'Home',

  components: {
    'overlay': Overlay,
    'account': Account
  },

  data () {
    return {
      requiredNetworks: ['ropsten', 'private'],
      connectedNetwork: '',
      isLoggedIntoMetamask: false,
      fundAmountInEther: '0'
    }
  },

  computed: {
    isOverlayShown () {
      return this.shouldShowInstallMetamaskPrompt || this.shouldShowLoginMetaMaskPrompt || this.shouldShowConnectNetworkMetaMaskPrompt
    },

    connectedNetworkLabel () {
      return config.networks[this.connectedNetwork]
    },

    requiredNetworkLabel () {
      let requiredNetworks = this.requiredNetworks.filter(network => network !== 'private')

      if (requiredNetworks.length === 1) {
        return config.networks[requiredNetworks[0]]
      }

      let requiredNetworkLabels = requiredNetworks.map(network => config.networks[network])

      return requiredNetworkLabels.join(' or ')
    },

    shouldShowInstallMetamaskPrompt () {
      return !this.isMetamaskInstalled
    },

    shouldShowLoginMetaMaskPrompt () {
      return this.isMetamaskInstalled && !this.isLoggedIntoMetamask
    },

    shouldShowConnectNetworkMetaMaskPrompt () {
      return this.isMetamaskInstalled && this.isLoggedIntoMetamask && !this.isConnectedToCorrectNetwork
    },

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
      return Web3.utils.fromWei(this.wei.toString() || '0', 'ether')
    },

    crowdFundingContractAddress () {
      return this.$store.state.crowdFundingContract.address
    },

    isMetamaskInstalled () {
      return Web3.givenProvider !== null && Web3.givenProvider.isMetaMask === true
    },

    isConnectedToCorrectNetwork () {
      return this.requiredNetworks.includes(this.connectedNetwork)
    },

    goal () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.goal.toString() || '0', 'ether')
    },

    value () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.value.toString() || '0', 'ether')
    },

    fundAmountInWei () {
      return Web3.utils.toWei(this.fundAmountInEther)
    }
  },

  mounted () {
    if (!this.isMetamaskInstalled) return

    window.web3 = new Web3(Web3.givenProvider)

    this.initialize()

    // We keep polling for changes
    // We cannot use events because of Web3 1.0
    setInterval(() => {
      this.initialize()
    }, 2000)
  },

  methods: {
    refresh () {
      location.reload()
    },

    initialize () {
      // Check if user is logged into metamask
      let a = this.getAccounts()
      let b = window.web3.eth.net.getNetworkType().then(result => {
        this.connectedNetwork = result

        if (!this.isConnectedToCorrectNetwork) {
          // Todo: Only repeat this part. But does the trick for now
          return Promise.reject(new Error('Is not connected to correct network'))
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
        return Promise.reject(new Error('Is not logged in'))
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

<style lang="scss" scoped>

</style>
