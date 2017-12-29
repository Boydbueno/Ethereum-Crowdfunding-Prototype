<template>
  <transition name="fade">
    <i-card v-show="pendingTxs.length > 0">
      <p slot="title">Transacties in afwachting</p>
      <i-table :columns="columns" :data="pendingTxs"></i-table>
    </i-card>
  </transition>
</template>

<script>
import Web3 from 'web3'

import { mapState } from 'vuex'

import { Spin, Card, Table } from 'iview'

export default {
  name: 'PendingTxs',

  components: {
    'i-table': Table,
    'i-card': Card
  },

  computed: {
    ...mapState([
      'pendingTxs'
    ])
  },

  data () {
    return {
      columns: [
        {
          title: ' ',
          render: (h, params) => {
            return h(Spin)
          }
        },
        {
          title: 'Bedrag',
          key: 'value',
          render: (h, params) => {
            return h('span', Web3.utils.fromWei(params.row.value, 'ether') + ' ETH')
          }
        },
        {
          title: 'Afzender',
          key: 'from',
          render: (h, params) => {
            if (params.row.from === this.account) {
              return h('span', 'Jij')
            } else {
              return h('span', 'Anoniem')
            }
          }
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }

  .fade-enter, .fade-leave-to {
    opacity: 0
  }
</style>
