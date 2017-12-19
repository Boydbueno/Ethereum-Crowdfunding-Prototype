<template>
  <div>

    <overlay :isVisible="shouldShowInstallMetamaskPrompt" title="Wil je investeren?">
      <p>
        Je hebt een plek nodig om je aandelen in zonnepanelen op te slaan! De perfecte plek is in een beveiligde portemonnee zoals <strong>MetaMask</strong>.
      </p>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/6Gf_kRE4MJU?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
      <p>
        <iButton type="primary" v-if="!installed" long @click="installMetaMask">Installeer MetaMask</iButton>
        <iButton type="primary" v-else long @click="refresh">Ik heb MetaMask geïnstalleerd</iButton>
      </p>
    </overlay>

    <overlay :isVisible="shouldShowLoginMetaMaskPrompt" title="Je MetaMask is nog vergrendeld">
      <p>
        Open MetaMask en volg de instructies om je account te ontgrendelen.
      </p>
      <img src="../assets/images/metamaskExtension.jpg" />
    </overlay>

    <overlay :isVisible="shouldShowConnectNetworkMetaMaskPrompt" title="Oops, je bent verbonden met het verkeerde netwerk">
      <p>
        Je bent op het moment verbonden met het <strong>{{ connectedNetworkLabel }}</strong>. <br /> Open MetaMask en schakel over naar het <strong>{{ requiredNetworkLabel }}</strong>.
      </p>
      <img src="../assets/images/metamaskNetworkSelection.png" />
    </overlay>

    <iRow type="flex" justify="center">
      <account v-if="!isOverlayShown"></account>
    </iRow>

    <iRow type="flex" justify="center">
      <section v-if="!isOverlayShown" class="contract">
        <iCard>
          <p slot="title">Zonnepanelen Maassilo Rotterdam</p>
          <iTooltip slot="extra" placement="top">
            <span slot="content"><a :href="'https://ropsten.etherscan.io/address/' + crowdFundingContractAddress" target="_blank">{{ crowdFundingContractAddress }}</a></span>
            <iIcon size="20" type="ios-information-outline"></iIcon>
          </iTooltip>
          <img src="../assets/images/maassilo.jpg">

          <section class="info">
            <iProgress :percent="Math.round(value / goal * 100)" hide-info></iProgress>

            <div class="stat">
              <span class="stat-number">{{ value }} ETH</span>
              <span class="stat-caption">geïnvesteerd van <strong>{{ goal }} ETH</strong> doel</span>
            </div>

            <div class="stat">
              <span class="stat-number">{{ crowdFundingContract.participantsCount }}</span>
              <span class="stat-caption">{{ crowdFundingContract.participantsCount === 1 ? "investeerder" : "investeerders" }}</span>
            </div>
          </section>

          <iCard>
            <p slot="title">Investeren</p>
            <section class="actions">
              <input type="number" v-model="fundAmountInEther" name="fundAmount" min="0.1" step="0.1">
              <iButton type="primary" name="fund" @click="fundOneEther" size="large">Investeer</iButton>
            </section>
          </iCard>
        </iCard>
      </section>
    </iRow>

  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'

import config from '../config'
import contractStore from '../contractStore'

import CrowdFunding from '../../build/contracts/SolarParkFunding.json'
import SolarToken from '../../build/contracts/SolarToken.json'

import { Button, Card, Icon, Progress, Row, Tooltip, InputNumber } from 'iview'

import Overlay from '@/components/Overlay'
import Account from '@/components/Account'

export default {
  name: 'Home',

  components: {
    'overlay': Overlay,
    'account': Account,
    'iButton': Button,
    'iCard': Card,
    'iProgress': Progress,
    'iRow': Row,
    'iIcon': Icon,
    'iTooltip': Tooltip,
    'iInputNumber': InputNumber
  },

  data () {
    return {
      requiredNetworks: ['ropsten', 'private'],
      installed: false,
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

    installMetaMask () {
      this.installed = true
      window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank')
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
