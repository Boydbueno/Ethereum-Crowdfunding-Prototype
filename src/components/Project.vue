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
        <i-progress :percent="Math.round(value / goal * 100) || 0" hide-info></i-progress>

        <div class="stat">
          <span class="stat-number">
            <animated-number :value="value" :decimals="1"></animated-number> ETH
            <animated-number :value="valueInEuros" :decimals="2" :format="formatEuro"></animated-number>
          </span>
          <span class="stat-caption">geïnvesteerd van <strong>{{ goal }} ETH</strong> doel</span>
        </div>

        <div class="stat">
          <animated-number class="stat-number" :value="crowdFundingContract.participantsCount"></animated-number>
          <span class="stat-caption">{{ crowdFundingContract.participantsCount === 1 ? "investeerder" : "investeerders" }}</span>
        </div>
      </section>

      <i-card>
        <p slot="title">Investeren</p>
        <section class="actions">
          <i-input-number size="large" :min="0.1" :step="0.1" v-model="fundAmountInEther"></i-input-number>
          <i-button type="primary" name="fund" @click="fund" size="large" :disabled="fundAmountInEther <= 0">Investeer</i-button>
        </section>
      </i-card>

      <i-spin size="large" fix v-if="isLoading || !crowdFundingContract.address"></i-spin>
    </i-card>

  </section>
</template>

<script>
import Web3 from 'web3'

import { mapState } from 'vuex'

import contractStore from '@/contractStore'

import AnimatedNumber from '@/components/AnimatedNumber'

import { InputNumber, Button, Affix, Card, Icon, Progress, Row, Tooltip, Message, Table, Spin } from 'iview'

export default {
  name: 'Project',

  components: {
    'animated-number': AnimatedNumber,
    'i-input-number': InputNumber,
    'i-progress': Progress,
    'i-tooltip': Tooltip,
    'i-button': Button,
    'i-table': Table,
    'i-affix': Affix,
    'i-card': Card,
    'i-icon': Icon,
    'i-spin': Spin,
    'i-row': Row
  },

  props: [
    'isLoading'
  ],

  data () {
    return {
      fundAmountInEther: 0.1
    }
  },

  computed: {
    goal () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.goal.toString() || '0', 'ether')
    },

    goalInEuros () {
      return this.goal.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
    },

    value () {
      return Web3.utils.fromWei(this.$store.state.crowdFundingContract.value.toString() || '0', 'ether')
    },

    valueInEuros () {
      return this.value * this.euroConversion
    },

    fundAmountInWei () {
      return Web3.utils.toWei(this.fundAmountInEther.toString())
    },

    ...mapState([
      'crowdFundingContract',
      'euroConversion',
      'pendingTxs',
      'account',
      'wei'
    ])
  },

  methods: {
    fund () {
      let msg = Message.loading({
        content: 'Aan het wachten op goedkeuring van de transactie..',
        duration: 0
      })

      contractStore.crowdFundingContract.contribute.sendTransaction({
        from: this.account,
        value: this.fundAmountInWei
      }).then((result) => {
        this.$store.commit('addPendingTx', {
          hash: result,
          from: this.account,
          value: this.fundAmountInWei
        })
        msg()
        msg = Message.loading({
          content: 'Bezig met het verwerken van de transactie, dit kan even duren..',
          duration: 0
        })
        this.fundAmountInEther = 0
      }).catch((e) => {
        msg()
        Message.error('De transactie is geannuleerd')
      })
    },

    formatEuro (value) {
      return value.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' })
    }
  }
}
</script>

<style lang="scss" scoped>
  img {
    width: 100%;
  }

  p {
    color: #666;
  }

  .stat {
    .stat-number {
      display: block;
      font-size: 20px;
      margin-bottom: -5px;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }

  .fade-enter, .fade-leave-to {
    opacity: 0
  }
</style>