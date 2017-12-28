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

        <i-table v-show="pendingTxs > 0" :columns="columns" :data="pendingTxs"></i-table>

        <transition name="fade">
          <i-table no-data-text="Geen transacties bezig" :columns="columns" :data="pendingTxs"></i-table>
        </transition>

        <i-card v-for="tx in this.$store.state.pendingTxs" :key="tx.id">
          <p>{{ tx.id }}</p>
        </i-card>
      </i-card>

      <i-spin size="large" fix v-if="isLoading"></i-spin>
    </i-card>

  </section>
</template>

<script>
import Web3 from 'web3'

import { mapState } from 'vuex'

import contractStore from '@/contractStore'

import { Button, Card, Icon, Progress, Row, Tooltip, Message, Table, Spin } from 'iview'

export default {
  name: 'Project',

  components: {
    'i-progress': Progress,
    'i-tooltip': Tooltip,
    'i-button': Button,
    'i-table': Table,
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
      fundAmountInEther: '0',
      columns: [
        {
          title: 'Status'
        },
        {
          title: 'Bedrag',
          key: 'value'
        },
        {
          title: 'Afzender',
          key: 'from'
        }
      ]
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
      'crowdFundingContract',
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
        to: contractStore.crowdFundingContract.address,
        value: this.fundAmountInWei
      }).then((result) => {
        this.$store.commit('addPendingTx', { txId: result })
        msg()
        msg = Message.loading({
          content: 'Bezig met het verwerken van de transactie, dit kan even duren..',
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