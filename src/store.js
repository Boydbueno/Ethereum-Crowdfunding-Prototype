import Vue from 'vue'
import Vuex from 'vuex'
import BigNumber from 'bignumber.js'

import config from '@/config.js'
import contractStore from './contractStore.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    euroConversion: 886,
    account: '',
    connectedNetwork: 'private',
    isLoggedIntoMetaMask: true,
    pendingTxs: [],
    pricePerPart: 0.1,
    partsPerSolarPanel: 6,
    wei: new BigNumber(0),
    tokens: new BigNumber(0),
    crowdFundingContract: {
      address: '',
      goal: new BigNumber(0),
      value: new BigNumber(0),
      tokenAddress: '',
      min: 0,
      deposit: 0,
      participantsCount: 0
    },
    solarTokenContract: {
      address: '',
      totalSupply: 0,
      share: 0
    }
  },

  getters: {
    connectedNetworkLabel (state) {
      return config.networks[state.connectedNetwork]
    },

    isConnectedToCorrectNetwork (state) {
      return config.requiredNetwork.includes(state.connectedNetwork)
    },

    fullPanels (state) {
      return Math.floor(state.tokens / state.partsPerSolarPanel)
    },

    leftOverPanelParts (state) {
      return state.tokens % state.partsPerSolarPanel
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

    increaseCrowdFundingValue (state, payload) {
      state.crowdFundingContract.value = state.crowdFundingContract.value.add(payload.wei)
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

    setCrowdFundingContractParticipantsCount (state, participantsCount) {
      state.crowdFundingContract.participantsCount = participantsCount
    },

    setSolarTokenContractAddress (state, address) {
      state.solarTokenContract.address = address
    },

    setSolarTokenTotalSupply (state, totalSupply) {
      state.solarTokenContract.totalSupply = totalSupply
    },

    setSolarTokenShare (state, share) {
      state.solarTokenContract.share = share
    },

    setAccount (state, account) {
      state.account = account
    },

    setWei (state, wei) {
      state.wei = wei
    },

    setTokens (state, tokens) {
      state.tokens = tokens
    },

    setConnectedNetwork (state, network) {
      state.connectedNetwork = network
    },

    setIsLoggedIntoMetaMask (state, isLoggedIn) {
      state.isLoggedIntoMetaMask = isLoggedIn
    },

    addPendingTx (state, payload) {
      state.pendingTxs.push(payload)
    },

    removePendingTx (state, payload) {
      state.pendingTxs = state.pendingTxs.filter(obj => obj.hash !== payload.txHash)
    }
  },

  actions: {
    updateCrowdFundingContractInformation ({ commit }) {
      // Todo: contractStore should have get methods that return a promise

      // Todo: Perhaps chain all these together and when all done make one commit
      contractStore.crowdFundingContract.goal.call().then(result => {
        commit('setCrowdFundingContractGoal', result)
      })

      contractStore.crowdFundingContract.value.call().then(result => {
        commit('setCrowdFundingContractValue', result)
      })

      contractStore.crowdFundingContract.tokenAddress.call().then(result => {
        commit('setCrowdFundingContractTokenAddress', result)
      })

      contractStore.crowdFundingContract.min.call().then(result => {
        commit('setCrowdFundingContractMin', result)
      })

      contractStore.crowdFundingContract.participantsCount.call().then(result => {
        commit('setCrowdFundingContractParticipantsCount', parseInt(result))
      })
    },

    updateSolarTokenContractInformation ({ commit }) {
      contractStore.solarTokenContract.totalSupply.call().then(result => {
        commit('setSolarTokenTotalSupply', result)
      })
    }
  }
})
