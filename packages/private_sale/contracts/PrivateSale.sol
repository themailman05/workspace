// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;
import "./ITokenManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PrivateSale
 * @dev purchase vested tokens
 */
contract PrivateSale is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  ITokenManager public tokenManager;
  IERC20 public pop;
  IERC20 public usdc;
  address public treasury;
  uint256 public tokenPrice = 15e4;
  uint256 public supply = 7500000 * 1e18;
  uint256 public constant minimumPurchase = 25000 * 1e6;
  uint256 constant secondsInDay = 86400;

  mapping(address => bool) public participants;
  mapping(address => uint256) public allowances;

  event TreasuryChanged(address from, address to);
  event ParticipantAllowed(address participant, uint256 allowance);
  event TokenPriceChanged(uint256 from, uint256 to);
  event TokensPurchased(address participant, uint256 amount);
  event SupplyChanged(uint256 from, uint256 to);

  constructor(
    ITokenManager tokenManager_,
    IERC20 pop_,
    IERC20 usdc_,
    address treasury_,
    uint256 supply_
  ) {
    tokenManager = tokenManager_;
    pop = pop_;
    usdc = usdc_;
    treasury = treasury_;
    supply = supply_;
  }

  function setTreasury(address treasury_) external onlyOwner {
    require(treasury != treasury_, "Same Treasury");
    address _previousTreasury = treasury;
    treasury = treasury_;
    emit TreasuryChanged(_previousTreasury, treasury);
  }

  function setSupply(uint256 supply_) external onlyOwner {
    require(supply != supply_, "Same supply");
    uint256 _previousSupply = supply;
    supply = supply_;
    emit SupplyChanged(_previousSupply, supply);
  }

  function allowParticipant(address participant_, uint256 allowance_) external onlyOwner {
    require(allowance_ >= minimumPurchase, "Allowance too low");
    participants[participant_] = true;
    allowances[participant_] = allowance_;
    emit ParticipantAllowed(participant_, allowance_);
  }

  function setTokenPrice(uint256 tokenPrice_) external onlyOwner {
    //@todo price checks
    uint256 _previousPrice = tokenPrice;
    tokenPrice = tokenPrice_;
    emit TokenPriceChanged(_previousPrice, tokenPrice);
  }

  function purchase(uint256 amount_) public nonReentrant {
    require(participants[msg.sender] == true, "Participant not allowed");
    require(amount_ >= minimumPurchase, "Minimum not met");
    require(allowances[msg.sender] >= amount_, "Allowance exceeded");

    uint256 _wholePopToReceive = amount_.div(tokenPrice);
    uint256 _popToReceive = _wholePopToReceive.mul(1e18);

    require(supply >= _popToReceive, "Not enough supply");

    supply = supply.sub(_popToReceive);
    allowances[msg.sender] = allowances[msg.sender].sub(amount_);

    usdc.safeTransferFrom(msg.sender, treasury, amount_);

    //@todo consider result
    tokenManager.assignVested(
      msg.sender,
      _wholePopToReceive,
      uint64(block.timestamp), // now
      uint64(block.timestamp.add(secondsInDay.mul(365))), // + 1 year
      uint64(block.timestamp.add(secondsInDay.mul(548))), // + 18 months
      true
    );

    emit TokensPurchased(msg.sender, _popToReceive);
  }
}
