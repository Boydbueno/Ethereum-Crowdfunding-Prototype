var BasicCrowdFunding = artifacts.require('./BasicCrowdFunding.sol')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(BasicCrowdFunding, accounts[0], 1, 2)
}
