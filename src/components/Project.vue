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
          <i-button type="primary" name="fund" @click="fundOneEther" size="large">Investeer</i-button>
        </section>
      </i-card>
    </i-card>
  </section>
</template>

<script>
import Web3 from 'web3'
import { mapState } from 'vuex'

import contractStore from '@/contractStore'

import { Button, Card, Icon, Progress, Row, Tooltip } from 'iview'

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
    }
  }
}
</script>

<style lang="scss" scoped>

</style>