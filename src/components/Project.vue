<template>
  <section class="contract">
    <i-card>
      <p slot="title">Zonnepanelen Maassilo Rotterdam</p>
      <i-tooltip slot="extra" placement="top">
        <span slot="content"><a :href="'https://ropsten.etherscan.io/address/' + crowdFundingContract.address" target="_blank">{{ crowdFundingContract.address }}</a></span>
        <i-icon size="20" type="ios-information-outline"></i-icon>
      </i-tooltip>
      <img src="../assets/images/maassilo.jpg">

      <section class="info">
        <i-progress :percent="Math.round(value / goal * 100)" hide-info></i-progress>

        <div class="stat">
          <span class="stat-number">{{ value }} ETH</span>
          <span class="stat-caption">geïnvesteerd van <strong>{{ goal }} ETH</strong> doel</span>
        </div>

        <div class="stat">
          <span class="stat-number">{{ crowdFundingContract.participantsCount }}</span>
          <span class="stat-caption">{{ crowdFundingContract.participantsCount === 1 ? "investeerder" : "investeerders" }}</span>
        </div>
      </section>

      <i-card>
        <p slot="title">Investeren</p>
        <section class="actions">
          <input type="number" v-model="fundAmountInEther" name="fundAmount" min="0.1" step="0.1">
          <i-button type="primary" name="fund" @click="fund" size="large" :disabled="fundAmountInEther <= 0">Investeer</i-button>
        </section>

        <i-card v-for="tx in this.$store.state.pendingTxs" :key="tx">
          <p>{{ tx }}</p>
        </i-card>
      </i-card>
    </i-card>

  </section>
</template>

<script>
import Web3 from 'web3'

import { mapState } from 'vuex'

import contractStore from '@/contractStore'

import { Button, Card, Icon, Progress, Row, Tooltip, Message } from 'iview'

export default {
  name: 'Project',

  components: {
    'i-progress': Progress,
    'i-tooltip': Tooltip,
    'i-button': Button,
    'i-card': Card,
    'i-icon': Icon,
    'i-row': Row
  },

  data () {
    return {
      fundAmountInEther: '0'
    }
  },

  computed: {
    goal () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.goal.toString() || '0', 'ether')
    },

    value () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.value.toString() || '0', 'ether')
    },

    fundAmountInWei () {
      return Web3.utils.toWei(this.fundAmountInEther)
    },

    ...mapState([
      'account',
      'wei',
      'crowdFundingContract'
    ])
  },

  methods: {
    fund () {
      let msg = Message.loading({
        content: 'Aan het wachten op bevestiging van de transactie..',
        duration: 0
      })

      contractStore.crowdFundingContract.contribute.sendTransaction({
        from: this.account,
        to: contractStore.crowdFundingContract.address,
        value: this.fundAmountInWei
      }).then((result) => {
        this.$store.commit('addPendingTx', { txId: result })
        msg()
        msg = Message.loading({
          content: 'Bezig met verwerken van de transactie..',
          duration: 0
        })
        this.fundAmountInEther = '0'
      }).catch((e) => {
        msg()
        Message.error('De transactie is geannuleerd')
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>