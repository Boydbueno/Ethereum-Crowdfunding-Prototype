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
      <div class="balance">{{ balance }} ETH</div>
    </i-card>
  </section>
</template>

<script>
import Web3 from 'web3'
import QRCode from 'qrcode'
import { mapState } from 'vuex'

import { Tooltip, Card, Icon, Row } from 'iview'

export default {
  name: 'Account',

  components: {
    'i-tooltip': Tooltip,
    'i-card': Card,
    'i-icon': Icon,
    'i-row': Row
  },

  computed: {
    balance () {
      return Web3.utils.fromWei(this.wei.toString() || '0', 'ether')
    },

    ...mapState([
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
</style>