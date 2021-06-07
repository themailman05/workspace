pragma solidity >=0.7.0 <0.8.0;

// https://docs.synthetix.io/contracts/source/contracts/owned
contract CouncilControlled {
  address private council;
  address public nominatedCouncil;

  constructor(address _council) public {
    require(_council != address(0), "Council address cannot be 0");
    council = _council;
    emit CouncilChanged(address(0), _council);
  }

  function nominateNewCouncil(address _council) external onlyCouncil {
    nominatedCouncil = _council;
    emit CouncilNominated(_council);
  }

  function acceptCouncil() external {
    require(
      msg.sender == nominatedCouncil,
      "You must be nominated before you can accept council"
    );
    emit CouncilChanged(council, nominatedCouncil);
    council = nominatedCouncil;
    nominatedCouncil = address(0);
  }

  modifier onlyCouncil {
    _onlyCouncil();
    _;
  }

  function _onlyCouncil() private view {
    require(
      msg.sender == council,
      "Only the contract council may perform this action"
    );
  }

  event CouncilNominated(address newCouncil);
  event CouncilChanged(address oldCouncil, address newCouncil);
}
