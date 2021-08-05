pragma solidity >=0.7.0 <0.8.0;

// https://docs.synthetix.io/contracts/source/contracts/owned
contract CouncilControlled {
  /* ========== STATE VARIABLES ========== */

  address public council;
  address public nominatedCouncil;

  /* ========== EVENTS ========== */

  event CouncilNominated(address newCouncil);
  event CouncilChanged(address oldCouncil, address newCouncil);

  /* ========== CONSTRUCTOR ========== */

  constructor(address _council) public {
    require(_council != address(0), "Council address cannot be 0");
    council = _council;
    emit CouncilChanged(address(0), _council);
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

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

  /* ========== RESTRICTED FUNCTIONS ========== */

  function _onlyCouncil() private view {
    require(
      msg.sender == council,
      "Only the contract council may perform this action"
    );
  }

  /* ========== MODIFIER ========== */

  modifier onlyCouncil() {
    _onlyCouncil();
    _;
  }
}
