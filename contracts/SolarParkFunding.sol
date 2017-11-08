pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';

contract SolarToken is BasicToken {
  function SolarToken(uint256 _totalSupply) public {
    totalSupply = _totalSupply;
  }
}

/**
 * @title SolarParkFunding
 * @dev Very basic contract for getting tokens for funding. Many features are kept out because this is not our focus. Just the way of gaining the tokens.
*/
contract SolarParkFunding {
  uint public value;

  mapping (address => uint256) public balanceOf;

  uint256 public tokenAddress;
  // Goal is also the max
  uint public goal;
  uint public min;

  event FundAdded(address backer, uint amount);

  function SolarParkFunding(uint256 tokenAddr, uint goalInWei, uint minWei) public {
    tokenAddress = tokenAddr;
    goal = goalInWei;
    min = minWei;
  }

  function () payable public {
    require(msg.value >= min);
    require(value + msg.value <= goal);

    uint amount = msg.value;
    balanceOf[msg.sender] += amount;
    value += amount;

    SolarToken token = SolarToken(tokenAddress);
    token.transfer(msg.sender, 1);

    FundAdded(msg.sender, amount);
  }

  function contribute() payable public {
    require(msg.value >= min);
    require(value + msg.value <= goal);

    uint amount = msg.value;
    balanceOf[msg.sender] += amount;
    value += amount;

    SolarToken token = SolarToken(tokenAddress);
    token.transfer(msg.sender, 1);

    FundAdded(msg.sender, amount);
  }
}