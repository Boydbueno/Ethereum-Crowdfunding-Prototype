pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/token/BasicToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract SolarToken is BasicToken {
  function SolarToken(uint256 _totalSupply) public {
    totalSupply = _totalSupply;
  }

  function award(address _to, uint256 _value) external {
  	require(totalSupply >= _value);

	balances[_to] = balances[_to].add(_value);
	totalSupply = totalSupply.sub(_value);
  }
}