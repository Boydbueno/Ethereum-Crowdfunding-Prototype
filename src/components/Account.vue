<template>
  <section class="account">
    <iCard>
      <p slot="title">Jouw account</p>
      <iTooltip slot="extra" placement="top">
        <span slot="content">{{ account }}</span>
        <iIcon size="20" type="ios-information-outline"></iIcon>
      </iTooltip>

      <div>Adres: {{ account }}</div>

      <canvas ref="qrcode"></canvas>

      <div>Balance: {{ balance }} ETH </div>
    </iCard>
  </section>
</template>

<script>
import Web3 from 'web3'
import QRCode from 'qrcode'

import { Card, Tooltip, Icon } from 'iview'

export default {
  name: 'Account',

  components: {
    'iCard': Card,
    'iTooltip': Tooltip,
    'iIcon': Icon
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

</style>