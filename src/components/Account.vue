<template>
  <section class="account">
    <i-card>
      <p slot="title">Jouw account</p>
      <i-tooltip slot="extra" placement="bottom">
        <span slot="content"><a :href="'https://ropsten.etherscan.io/address/' + account" target="_blank">{{ account }}</a></span>
        <i-icon size="20" type="ios-information-outline"></i-icon>
      </i-tooltip>

      <i-row type="flex" justify="center">
        <canvas ref="qrcode"></canvas>
      </i-row>

      <div class="balance-title"><strong>Balance</strong></div>
      <div class="balance">{{ balance }} ETH ({{ euroBalance }})</div>

      <i-spin size="large" fix v-if="isLoading || account === ''"></i-spin>
    </i-card>
  </section>
</template>

<script>
import Web3 from 'web3'
import QRCode from 'qrcode'
import { mapState } from 'vuex'

import { Tooltip, Card, Icon, Spin, Row } from 'iview'

export default {
  name: 'Account',

  components: {
    'i-tooltip': Tooltip,
    'i-card': Card,
    'i-icon': Icon,
    'i-spin': Spin,
    'i-row': Row
  },

  props: [
    'isLoading'
  ],

  computed: {
    balance () {
      return Math.round(Web3.utils.fromWei(this.wei.toString() || '0', 'ether') * 1000) / 1000
    },

    euroBalance () {
      return (this.balance * this.euroConversion).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
    },

    ...mapState([
      'euroConversion',
      'account',
      'wei'
    ])
  },

  mounted () {
    if (this.account) this.renderQrCode(this.account)

    this.$watch('account', this.renderQrCode)
  },

  methods: {
    renderQrCode (account) {
      QRCode.toCanvas(this.$refs.qrcode, account, (err) => {
        if (err) console.log(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .balance-title, .balance {
    text-align: center;
  }

  a {
    color: white;
    text-decoration: underline;
  }

  p {
    color: #666;
  }

  canvas {
    width: 148px;
    height: 148px;
  }
</style>