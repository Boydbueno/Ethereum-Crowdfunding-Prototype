<template>
  <section class="account">
    <header>
      <h1>Your account</h1>
    </header>

    <div>Address: {{ account }}</div>

    <canvas ref="qrcode"></canvas>

    <div>Balance: {{ balance }} ETH </div>
  </section>
</template>

<script>
import Web3 from 'web3'
import QRCode from 'qrcode'

export default {
  name: 'Account',

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