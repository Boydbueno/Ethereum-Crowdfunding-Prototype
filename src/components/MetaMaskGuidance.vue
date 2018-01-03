<template>
  <div>
    <overlay :isVisible="metamaskState === 0" title="Wil je investeren?">
        
      <i-steps :current="step" direction="vertical">
        <i-step title="Installeer MetaMask" content="MetaMask is een veilige plek om je aandelen te bewaren, dit gebruik je ook om in te loggen"></i-step>
        <i-step title="Ik heb MetaMask geïnstalleerd" content="Vernieuw de pagina om verder te gaan"></i-step>
        <i-step title="Begin met beleggen!"></i-step>
      </i-steps>

      <p>
        <i-button :type="!isInstallClicked ? 'primary' : 'success'" :loading="isRefreshClicked" long @click="onButtonClick">
          <template v-if="!isInstallClicked">
            Naar MetaMask
          </template>
          <template v-else>
            Pagina vernieuwen
          </template>
        </i-button>
      </p>
    </overlay>

    <overlay :isVisible="metamaskState === 1" title="Je MetaMask is nog vergrendeld">
      <p>
        Open MetaMask en volg de instructies om je account te ontgrendelen.
      </p>
      <img src="../assets/images/metamaskExtension.jpg" />
    </overlay>

    <overlay :isVisible="metamaskState === 2" title="Oops, je bent verbonden met het verkeerde netwerk">
      <p>
        Je bent op het moment verbonden met het <strong>{{ connectedNetworkLabel }}</strong>. <br /> Open MetaMask en schakel over naar het <strong>{{ requiredNetworkLabel }}</strong>.
      </p>
      <img src="../assets/images/metamaskNetworkSelection.png" />
    </overlay>
  </div>
</template>

<script>
import config from '@/config'
import { mapState, mapGetters } from 'vuex'

import Overlay from '@/components/Overlay'
import MetaMaskService from '@/services/MetaMaskService'

import { Button, Steps, Step, LoadingBar } from 'iview'

export default {
  name: 'MetaMaskGuidance',

  components: {
    'overlay': Overlay,
    'i-button': Button,
    'i-steps': Steps,
    'i-step': Step
  },

  data () {
    return {
      isInstallClicked: false,
      isRefreshClicked: false,
      step: 0
    }
  },

  computed: {
    requiredNetworkLabel () {
      let requiredNetwork = config.requiredNetwork.filter(network => network !== 'private')

      if (requiredNetwork.length === 1) {
        return config.networks[requiredNetwork[0]]
      }

      let requiredNetworkLabels = requiredNetwork.map(network => config.networks[network])

      return requiredNetworkLabels.join(' or ')
    },

    metamaskState () {
      if (!this.isMetamaskInstalled) return 0

      if (!this.isLoggedIntoMetaMask) return 1

      if (!this.isConnectedToCorrectNetwork) return 2

      return 3
    },

    isMetamaskInstalled () {
      return MetaMaskService.isInstalled()
    },

    ...mapState([
      'connectedNetwork',
      'isLoggedIntoMetaMask'
    ]),

    ...mapGetters([
      'connectedNetworkLabel',
      'isConnectedToCorrectNetwork'
    ])
  },

  methods: {
    onButtonClick () {
      if (!this.isInstallClicked) {
        this.installMetaMask()
      } else {
        this.refresh()
      }
    },

    refresh () {
      this.step = 2
      this.isRefreshClicked = true

      LoadingBar.start()

      window.setTimeout(LoadingBar.finish, 750)
      window.setTimeout(window.location.reload.bind(window.location), 1000)
    },

    installMetaMask () {
      this.isInstallClicked = true
      this.step = 1

      window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>