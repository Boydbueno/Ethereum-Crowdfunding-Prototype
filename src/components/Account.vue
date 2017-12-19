<template>
  <section class="account">
    <iCard>
      <p slot="title">Jouw account</p>
      <iTooltip slot="extra" placement="bottom">
        <span slot="content"><a :href="'https://ropsten.etherscan.io/address/' + account" target="_blank">{{ account }}</a></span>
        <iIcon size="20" type="ios-information-outline"></iIcon>
      </iTooltip>

      <iRow type="flex" justify="center">
        <canvas ref="qrcode"></canvas>
      </iRow>

      <div class="balance-title"><strong>Balance</strong></div>
      <div class="balance">{{ balance }} ETH</div>
    </iCard>
  </section>
</template>

<script>
import Web3 from 'web3'
import QRCode from 'qrcode'

import { Card, Tooltip, Icon, Row } from 'iview'

export default {
  name: 'Account',

  components: {
    'iCard': Card,
    'iTooltip': Tooltip,
    'iIcon': Icon,
    'iRow': Row
  },

  computed: {
    account () {
      return this.$store.state.account
    },

    wei () {
      return this.$store.state.wei
    },

    balance () {
      return Web3.utils.fromWei(this.wei.toString() || '0', 'ether')
    }
  },

  mounted () {
    QRCode.toCanvas(this.$refs.qrcode, this.account, (err) => {
      if (err) console.log(err)
    })

    this.$watch('account', newAccount => {
      QRCode.toCanvas(this.$refs.qrcode, newAccount, (err) => {
        if (err) console.log(err)
      })
    })
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