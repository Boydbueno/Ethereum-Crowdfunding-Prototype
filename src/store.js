import Vue from 'vue'
import Vuex from 'vuex'
import BigNumber from 'bignumber.js'

import contractStore from './contractStore.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    crowdFundingContract: {
      address: '',
      goal: new BigNumber(0),
      value: new BigNumber(0),
      tokenAddress: '',
      min: 0,
      deposit: 0
    },
    solarTokenContract: {
      address: '',
      totalSupply: 0,
      share: 0
    }
  },

  mutations: {
    setCrowdFundingContractAddress (state, address) {
      state.crowdFundingContract.address = address
    },

    setCrowdFundingContractGoal (state, goal) {
      state.crowdFundingContract.goal = goal
    },

    setCrowdFundingContractValue (state, value) {
      state.crowdFundingContract.value = value
    },

    setCrowdFundingContractTokenAddress (state, tokenAddress) {
      state.crowdFundingContract.tokenAddress = tokenAddress
    },

    setCrowdFundingContractMin (state, min) {
      state.crowdFundingContract.min = min
    },

    setCrowdFundingContractDeposit (state, deposit) {
      state.crowdFundingContract.deposit = deposit
    },

    setSolarTokenContractAddress (state, address) {
      state.solarTokenContract.address = address
    },

    setSolarTokenTotalSupply (state, totalSupply) {
      state.solarTokenContract.totalSupply = totalSupply
    },

    setSolarTokenShare (state, share) {
      state.solarTokenContract.share = share
    }
  },

  actions: {
    updateCrowdFundingContractInformation (context) {
      // Todo: contractStore should have get methods that return a promise

      // Todo: Perhaps chain all these together and when all done make one commit
      contractStore.crowdFundingContract.goal.call().then((result) => {
        context.commit('setCrowdFundingContractGoal', result)
      })

      contractStore.crowdFundingContract.value.call().then((result) => {
        context.commit('setCrowdFundingContractValue', result)
      })

      contractStore.crowdFundingContract.tokenAddress.call().then((result) => {
        context.commit('setCrowdFundingContractTokenAddress', result)
      })

      contractStore.crowdFundingContract.min.call().then((result) => {
        context.commit('setCrowdFundingContractMin', result)
      })
    },

    updateSolarTokenContractInformation (context) {
      contractStore.solarTokenContract.totalSupply.call().then((result) => {
        context.commit('setSolarTokenTotalSupply', result)
      })
    }
  }
})
