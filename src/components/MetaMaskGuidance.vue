<template>
  <div>
    <overlay :isVisible="metamaskState === 0" title="Wil je investeren?">
      <p>
        Je hebt een plek nodig om je aandelen in zonnepanelen op te slaan! De perfecte plek is in een beveiligde portemonnee zoals <strong>MetaMask</strong>.
      </p>
      <iframe width="560" height="315" src="https://www.youtube.com/embed/6Gf_kRE4MJU?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
      <p>
        <i-button type="primary" v-if="!isInstallClicked" long @click="installMetaMask">Installeer MetaMask</i-button>
        <i-button type="primary" v-else long @click="refresh">Ik heb MetaMask geïnstalleerd</i-button>
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

import { Button } from 'iview'

export default {
  name: 'MetaMaskGuidance',

  components: {
    'overlay': Overlay,
    'i-button': Button
  },

  data () {
    return {
      isInstallClicked: false
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
    refresh () {
      location.reload()
    },

    installMetaMask () {
      this.isInstallClicked = true
      window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>