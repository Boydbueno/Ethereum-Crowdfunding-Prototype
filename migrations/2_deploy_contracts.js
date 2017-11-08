const config = require('../src/config.js')

const ether = 1000000000000000000
const etherDivider = 100000

const SolarParkFunding = artifacts.require('./SolarParkFunding.sol')
const SolarToken = artifacts.require('./SolarToken.sol')

const goal = config.crowdFunding.goal / etherDivider * ether
const steps = config.crowdFunding.steps / etherDivider * ether

const totalTokens = goal / steps

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SolarToken, totalTokens).then(() => {
    return deployer.deploy(SolarParkFunding, SolarToken.address, goal, steps)
  })
}
