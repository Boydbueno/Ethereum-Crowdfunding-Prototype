pragma solidity ^0.4.15;

/**
	Very basic crowdfunding
	Allows people to throw in ether
**/
contract BasicCrowdfunding {
	uint public value;
    mapping (address => uint256) public balanceOf;

    address public beneficiary;
    uint public goal;
    uint public max;

    bool public isClosed = false;

    event FundWithdrawn(address withdrawer, uint amount);
    event FundAdded(address backer, uint amount);
    
    function BasicCrowdfunding(address ifSuccessfulSendTo, uint goalInEther, uint maxEther) public {
	    beneficiary = ifSuccessfulSendTo;
	    goal = goalInEther;
	    max = maxEther;

	    // Todo: Can we make sure that the max is more then the goal?
	}

	function () payable public {
		require(msg.value > 0);
		require(msg.value + value <= max);

		uint amount = msg.value;
		balanceOf[msg.sender] += amount;
		value += amount;

		FundAdded(msg.sender, amount);
	}

	function withdraw() public {
		// Todo: Only allow claiming when the crowdfunding is still ongoing

		// Conditions
		require(balanceOf[msg.sender] > 0);

		// Effects
		uint amount = balanceOf[msg.sender];
		balanceOf[msg.sender] = 0;
		value -= amount;

		FundWithdrawn(msg.sender, amount);

		// Interactions		
		msg.sender.transfer(amount);
	}

	function claim() public {
		// Todo: Only allow claiming when crowdfund is over

	    // Conditions
		require(msg.sender == beneficiary);
		require(value >= goal);

        // Effects
		uint valueToTransfer = value;
		value = 0;
		
		FundWithdrawn(beneficiary, valueToTransfer);

        // Interactions
		beneficiary.transfer(valueToTransfer);
	}
}