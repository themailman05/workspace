// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./IBeneficiaryRegistry.sol";
import "./ITreasury.sol";
import "./IStaking.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract RewardsManager is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  uint256 public constant SWAP_TIMEOUT = 3600;

  IERC20 public immutable pop;
  IStaking public staking;
  ITreasury public treasury;
  IBeneficiaryRegistry public beneficiaryRegistry;
  IUniswapV2Factory public immutable uniswapV2Factory;
  IUniswapV2Router02 public immutable uniswapV2Router;

  uint256 public previousPopBalance;
  uint256[3] public rewardSplits;
  mapping(uint8 => uint256[2]) private rewardLimits;

  Vault[3] private vaults;

  enum RewardTargets {Staking, Treasury, Beneficiaries}
  enum VaultStatus {Initialized, Open, Closed}

  struct Vault {
    uint256 totalDeposited;
    uint256 currentBalance;
    uint256 unclaimedShare;
    mapping(address => bool) claimed;
    bytes32 merkleRoot;
    uint256 endTime;
    VaultStatus status;
  }

  event VaultInitialized(uint8 vaultId, bytes32 merkleRoot);
  event VaultOpened(uint8 vaultId);
  event VaultClosed(uint8 vaultId);
  event VaultDeposited(uint8 vaultId, uint256 amount);
  event StakingDeposited(address to, uint256 amount);
  event TreasuryDeposited(address to, uint256 amount);
  event RewardsApplied(uint256 amount);
  event RewardClaimed(uint8 vaultId, address beneficiary, uint256 amount);
  event RewardSplitsUpdated(uint256[3] splits);
  event TokenSwapped(address token, uint256 amountIn, uint256 amountOut);

  modifier vaultExists(uint8 vaultId_) {
    require(vaultId_ < 3, "Invalid vault id");
    require(vaults[vaultId_].endTime > 0, "Uninitialized vault slot");
    _;
  }

  constructor(
    IERC20 pop_,
    IStaking staking_,
    ITreasury treasury_,
    IBeneficiaryRegistry beneficiaryRegistry_,
    IUniswapV2Router02 uniswapV2Router_
  ) {
    pop = pop_;
    staking = staking_;
    treasury = treasury_;
    beneficiaryRegistry = beneficiaryRegistry_;
    uniswapV2Router = uniswapV2Router_;
    uniswapV2Factory = IUniswapV2Factory(uniswapV2Router_.factory());
    rewardLimits[uint8(RewardTargets.Staking)] = [20e18, 80e18];
    rewardLimits[uint8(RewardTargets.Treasury)] = [10e18, 80e18];
    rewardLimits[uint8(RewardTargets.Beneficiaries)] = [20e18, 90e18];
    rewardSplits = [33e18, 33e18, 34e18];
  }

  function setStaking(IStaking staking_) public onlyOwner {
    require(staking_ != staking, "Same Staking");
    staking = staking_;
  }

  function setTreasury(ITreasury treasury_) public onlyOwner {
    require(treasury_ != treasury, "Same Treasury");
    treasury = treasury_;
  }

  function setBeneficaryRegistry(IBeneficiaryRegistry beneficiaryRegistry_)
    public
    onlyOwner
  {
    require(
      beneficiaryRegistry_ != beneficiaryRegistry,
      "Same Beneficiary Registry"
    );
    beneficiaryRegistry = beneficiaryRegistry_;
  }

  function setRewardSplits(uint256[3] calldata splits_) public onlyOwner {
    //@todo check input length?
    uint256 _total = 0;
    for (uint8 i = 0; i < 3; i++) {
      require(
        splits_[i] >= rewardLimits[i][0] && splits_[i] <= rewardLimits[i][1],
        "Invalid split"
      );
      _total = _total.add(splits_[i]);
    }
    require(_total == 100e18, "Invalid split total");
    rewardSplits = splits_;
    emit RewardSplitsUpdated(splits_);
  }

  function initializeVault(
    uint8 vaultId_,
    uint256 endTime_,
    bytes32 merkleRoot_
  ) public onlyOwner {
    require(vaultId_ < 3, "Invalid vault id");
    require(endTime_ > block.timestamp, "Invalid end block");
    require(
      vaults[vaultId_].status != VaultStatus.Open,
      "Vault must not be open"
    );

    delete vaults[vaultId_];
    Vault storage v = vaults[vaultId_];
    v.totalDeposited = 0;
    v.currentBalance = 0;
    v.unclaimedShare = 100e18;
    v.merkleRoot = merkleRoot_;
    v.endTime = endTime_;
    v.status = VaultStatus.Initialized;

    emit VaultInitialized(vaultId_, merkleRoot_);
  }

  function openVault(uint8 vaultId_) public onlyOwner vaultExists(vaultId_) {
    require(
      vaults[vaultId_].status == VaultStatus.Initialized,
      "Vault must be initialized"
    );

    vaults[vaultId_].status = VaultStatus.Open;

    emit VaultOpened(vaultId_);
  }

  function closeVault(uint8 vaultId_) public onlyOwner vaultExists(vaultId_) {
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    require(block.timestamp >= vaults[vaultId_].endTime, "Vault has not ended");

    uint256 _remainingBalance = vaults[vaultId_].currentBalance;
    vaults[vaultId_].currentBalance = 0;
    vaults[vaultId_].status = VaultStatus.Closed;

    _distributeToVaults(_remainingBalance);

    emit VaultClosed(vaultId_);
  }

  function verifyClaim(
    uint8 vaultId_,
    bytes32[] memory proof_,
    address beneficiary_,
    uint256 share_
  ) public view vaultExists(vaultId_) returns (bool) {
    require(msg.sender == beneficiary_, "Sender must be beneficiary");
    require(vaults[vaultId_].status == VaultStatus.Open, "Vault must be open");
    require(
      beneficiaryRegistry.beneficiaryExists(beneficiary_) == true,
      "Beneficiary does not exist"
    );

    return
      MerkleProof.verify(
        proof_,
        vaults[vaultId_].merkleRoot,
        bytes32(keccak256(abi.encodePacked(beneficiary_, share_)))
      );
  }

  function claimReward(
    uint8 vaultId_,
    bytes32[] memory proof_,
    address beneficiary_,
    uint256 share_
  ) public nonReentrant vaultExists(vaultId_) {
    require(
      verifyClaim(vaultId_, proof_, beneficiary_, share_) == true,
      "Invalid claim"
    );
    require(hasClaimed(vaultId_, beneficiary_) == false, "Already claimed");

    _applyRewards();

    uint256 _reward =
      vaults[vaultId_].currentBalance.mul(share_).div(
        vaults[vaultId_].unclaimedShare
      );
    vaults[vaultId_].unclaimedShare = vaults[vaultId_].unclaimedShare.sub(
      share_
    );
    vaults[vaultId_].currentBalance = vaults[vaultId_].currentBalance.sub(
      _reward
    );

    vaults[vaultId_].claimed[beneficiary_] = true;

    pop.transfer(beneficiary_, _reward);

    previousPopBalance = pop.balanceOf(address(this));

    emit RewardClaimed(vaultId_, beneficiary_, _reward);
  }

  function swapTokenForRewards(address[] calldata path_, uint256 amountOut_)
    public
    nonReentrant
    returns (uint256[] memory)
  {
    require(path_.length >= 2, "Invalid swap path");
    require(amountOut_ >= 1, "Invalid amount");
    require(
      path_[path_.length - 1] == address(pop),
      "POP must be last in path"
    );

    IERC20 _token = IERC20(path_[0]);
    uint256 _balance = _token.balanceOf(address(this));
    require(_balance > 0, "No swappable balance");

    _token.safeIncreaseAllowance(address(uniswapV2Router), _balance);
    uint256[] memory _amounts =
      uniswapV2Router.swapExactTokensForTokens(
        _balance,
        amountOut_,
        path_,
        address(this),
        block.timestamp.add(SWAP_TIMEOUT)
      );

    emit TokenSwapped(path_[0], _amounts[0], _amounts[1]);

    _applyRewards();

    previousPopBalance = pop.balanceOf(address(this));

    return _amounts;
  }

  function _applyRewards() internal {
    uint256 _availableReward = 0;
    uint256 _currentBalance = pop.balanceOf(address(this));
    if (_currentBalance > previousPopBalance) {
      _availableReward = _currentBalance.sub(previousPopBalance);
    }
    if (_availableReward == 0) return;

    previousPopBalance = _currentBalance;

    //@todo check edge case precision overflow
    uint256 _stakingAmount =
      _availableReward.mul(rewardSplits[uint8(RewardTargets.Staking)]).div(
        100e18
      );
    uint256 _treasuryAmount =
      _availableReward.mul(rewardSplits[uint8(RewardTargets.Treasury)]).div(
        100e18
      );
    uint256 _beneficiariesAmount =
      _availableReward
        .mul(rewardSplits[uint8(RewardTargets.Beneficiaries)])
        .div(100e18);

    _distributeToStaking(_stakingAmount);
    _distributeToTreasury(_treasuryAmount);
    _distributeToVaults(_beneficiariesAmount);

    emit RewardsApplied(_availableReward);
  }

  function getVault(uint8 vaultId_)
    public
    view
    vaultExists(vaultId_)
    returns (
      uint256 totalDeposited,
      uint256 currentBalance,
      uint256 unclaimedShare,
      bytes32 merkleRoot,
      uint256 endTime,
      VaultStatus status
    )
  {
    totalDeposited = vaults[vaultId_].totalDeposited;
    currentBalance = vaults[vaultId_].currentBalance;
    unclaimedShare = vaults[vaultId_].unclaimedShare;
    merkleRoot = vaults[vaultId_].merkleRoot;
    endTime = vaults[vaultId_].endTime;
    status = vaults[vaultId_].status;
  }

  function _distributeToStaking(uint256 amount_) internal {
    if (amount_ == 0) return;
    pop.transfer(address(staking), amount_);
    emit StakingDeposited(address(staking), amount_);
  }

  function _distributeToTreasury(uint256 amount_) internal {
    if (amount_ == 0) return;
    pop.transfer(address(treasury), amount_);
    emit TreasuryDeposited(address(treasury), amount_);
  }

  function _distributeToVaults(uint256 amount_) internal {
    if (amount_ == 0) return;
    uint8 _openVaultCount = 0;

    for (uint8 i = 0; i < vaults.length; i++) {
      if (vaults[i].status == VaultStatus.Open) {
        _openVaultCount += 1;
      }
    }

    if (_openVaultCount == 0) {
      pop.transfer(owner(), amount_);
      return;
    }

    //@todo handle dust after div
    uint256 distribution = amount_.div(_openVaultCount);

    for (uint8 _vaultId = 0; _vaultId < vaults.length; _vaultId++) {
      vaults[_vaultId].totalDeposited = vaults[_vaultId].totalDeposited.add(
        distribution
      );
      vaults[_vaultId].currentBalance = vaults[_vaultId].currentBalance.add(
        distribution
      );
      emit VaultDeposited(_vaultId, distribution);
    }
  }

  function hasClaimed(uint8 vaultId_, address beneficiary_)
    public
    view
    vaultExists(vaultId_)
    returns (bool)
  {
    return vaults[vaultId_].claimed[beneficiary_];
  }
}
