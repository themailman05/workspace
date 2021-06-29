pragma solidity >=0.7.0 <0.8.0;

// https://docs.synthetix.io/contracts/source/contracts/owned
contract KeeperIncentive is Governed {

  struct Incentive{
    uint256 callTime, //timestamp 
    uint256 deadline, //timestamp
    uint256 interval, //timestamp
    uint256 reward,
    bool openToEveryone //can only whitelisted accounts call or not?
  }

  /* ========== STATE VARIABLES ========== */

  Incentive[] public incentives;
  uint256 public incentiveBudget;
  mapping(address => bool) public whitelisted;

  /* ========== EVENTS ========== */
  event OwnerNominated(address newOwner);
  event OwnerChanged(address oldOwner, address newOwner);

  /* ========== CONSTRUCTOR ========== */

  constructor(address _governance) public Governed(_governance) {}

  /* ========== SETTER ========== */

  /* ========== RESTRICTED FUNCTIONS ========== */


  /* ========== MODIFIER ========== */

  modifier keeperIncentive(uint256 _incentiveId) {
    Incentive storage incentive = incentives[_incentiveId];

    if(!incentive.openToEveryone){
      require(whitelisted[msg.sender],"you are not whitelisted");
    }
    require(block.timestamp >= callTime && block.timestamp <= deadline, "wrong timing");

    
    _;
  }

}
