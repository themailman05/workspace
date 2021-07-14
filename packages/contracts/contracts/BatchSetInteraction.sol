// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Defended.sol";
import "./Interfaces/Integrations/YearnVault.sol";
import "./Interfaces/Integrations/CurveContracts.sol";
import "./Interfaces/Integrations/BasicIssuanceModule.sol";
import "./Interfaces/Integrations/ISetToken.sol";

contract BatchSetInteraction is ReentrancyGuard, Defended {
  using SafeMath for uint256;
  using SafeERC20 for ThreeCrv;
  using SafeERC20 for CrvLPToken;
  using SafeERC20 for YearnVault;
  using SafeERC20 for IERC20;

  enum BatchType {
    Mint,
    Redeem
  }

  struct UnderlyingToken {
    IERC20 token;
    uint256 allocation;
    YearnVault yearnVault;
    CurveMetapool curveMetaPool;
  }

  struct Batch {
    uint256 unclaimedShares;
    uint256[] tokenBalance;
    mapping(address => uint256) shareBalance;
    BatchType batchType;
  }

  /* ========== STATE VARIABLES ========== */

  ThreeCrv public threeCrv;
  CurveAddressProvider public curveAddressProvider;
  CurveRegistry public curveRegistry;
  BasicIssuanceModule public setBasicIssuanceModule;
  ISetToken public setToken;
  UnderlyingToken[] public underlyingToken;

  uint256 constant BPS_DENOMINATOR = 10_000;

  mapping(address => bytes32[]) public batchesOfAccount;
  mapping(bytes32 => Batch) public batches;

  //TODO turn these into arrays if the TokenSet[] functionality stays
  uint256 public lastMintedAt;
  uint256 public lastRedeemedAt;
  bytes32 public currentMintBatchId;
  bytes32 public currentRedeemBatchId;
  uint256 public batchCooldown;

  /* ========== EVENTS ========== */

  event Deposit(address indexed from, uint256 deposit);
  event Withdrawal(address indexed to, uint256 amount);
  event Claimed(address account, uint256 amount);
  event TokenSetAdded(ISetToken setToken);

  /* ========== CONSTRUCTOR ========== */

  constructor(
    ThreeCrv threeCrv_,
    CurveAddressProvider curveAddressProvider_,
    BasicIssuanceModule basicIssuanceModule_,
    ISetToken setToken_
  ) {
    require(address(threeCrv_) != address(0));
    require(address(curveAddressProvider_) != address(0));
    require(address(basicIssuanceModule_) != address(0));

    threeCrv = threeCrv_;
    curveAddressProvider = curveAddressProvider_;
    curveRegistry = CurveRegistry(curveAddressProvider.get_registry());
    setBasicIssuanceModule = basicIssuanceModule_;
    setToken = setToken_;
  }

  /* ========== VIEWS ========== */

  /* ========== MUTATIVE FUNCTIONS ========== */

  /**
   * @notice deposits funds for batch set minting
   * @param  amount_ amount of 3crv to use for minting
   */
  //TODO should it be possible to make multiple yearn tokenSets?
  function depositForMint(uint256 amount_) external {
    require(threeCrv.balanceOf(msg.sender) > 0, "insufficent balance");
    threeCrv.transferFrom(msg.sender, address(this), amount_);
    _deposit(amount_, currentMintBatchId);
  }

  /**
   * @notice deposits funds for batch reedeming of a set
   * @param  amount_ amount of setToken to be redeemed
   */
  function depositForRedeem(uint256 amount_) external {
    require(setToken.balanceOf(msg.sender) > 0, "insufficient balance");
    setToken.transferFrom(msg.sender, address(this), amount_);
    _deposit(amount_, currentRedeemBatchId);
  }

  /**
   * @notice claims funds from batch
   * @param  batchId_ id of batch to claim from
   */
  function claimMinted(bytes32 batchId_) external {
    Batch storage batch = batches[batchId_];
    uint256 shares = batch.shareBalance[msg.sender];
    require(shares <= batch.unclaimedShares, "claiming too many shares");

    uint256 claimableToken = _claim(
      shares,
      batch.unclaimedShares,
      batch.tokenBalance[0],
      setToken
    );

    batch.tokenBalance[0] = batch.tokenBalance[0].sub(claimableToken);
    batch.unclaimedShares = batch.unclaimedShares.sub(shares);
    batch.shareBalance[msg.sender] = 0;

    emit Claimed(msg.sender, shares);
  }

  /**
   * @notice claims funds from batch
   * @param  batchId_ id of batch to claim from
   */
  function claimRedeemed(bytes32 batchId_) external {
    Batch storage batch = batches[batchId_];
    uint256 shares = batch.shareBalance[msg.sender];
    require(shares <= batch.unclaimedShares, "claiming too many shares");

    for (uint256 i; i < batch.tokenBalance.length; i++) {
      uint256 claimableToken = _claim(
        shares,
        batch.unclaimedShares,
        batch.tokenBalance[i],
        underlyingToken[i].token
      );
      batch.tokenBalance[i] = batch.tokenBalance[i].sub(claimableToken);
    }

    batch.unclaimedShares = batch.unclaimedShares.sub(shares);
    batch.shareBalance[msg.sender] = 0;

    emit Claimed(msg.sender, shares);
  }

  function batchMint(uint256 amount_) external {
    require(
      block.timestamp.sub(lastMintedAt) >= batchCooldown,
      "can not execute batch action yet"
    );
    uint256 threeCrvBalance = threeCrv.balanceOf(address(this));
    require(threeCrvBalance > 0, "insufficient balance");

    for (uint256 i; i < underlyingToken.length; i++) {
      uint256 allocation = threeCrvBalance
      .mul(underlyingToken[i].allocation)
      .div(100e18);
      uint256 crvLPTokenAmount = _sendToCurve(
        allocation,
        underlyingToken[i].curveMetaPool
      );
      _sendToYearn(
        crvLPTokenAmount,
        underlyingToken[i].token,
        underlyingToken[i].yearnVault
      );
      underlyingToken[i].token.approve(
        address(setBasicIssuanceModule),
        underlyingToken[i].token.balanceOf(address(this))
      );
    }
    uint256 oldBalance = setToken.balanceOf(address(this));
    setBasicIssuanceModule.issue(setToken, amount_, address(this));
    batches[currentMintBatchId].tokenBalance[0] = setToken
    .balanceOf(address(this))
    .sub(oldBalance);

    lastMintedAt = block.timestamp;
    currentMintBatchId = _generateNextWithdrawalBatchId(currentMintBatchId);
  }

  function batchRedeem(uint256 amount_) external {
    require(
      block.timestamp.sub(lastMintedAt) >= batchCooldown,
      "can not execute batch action yet"
    );
    uint256 setTokenBalance = setToken.balanceOf(address(this));
    require(setTokenBalance > 0, "insufficient balance");

    setToken.approve(
      address(setBasicIssuanceModule),
      setToken.balanceOf(address(this))
    );

    uint256[] memory oldBalances;
    for (uint256 i; i < underlyingToken.length; i++) {
      oldBalances[i] = underlyingToken[i].token.balanceOf(address(this));
    }
    setBasicIssuanceModule.redeem(setToken, amount_, address(this));

    for (uint256 i; i < underlyingToken.length; i++) {
      batches[currentMintBatchId].tokenBalance.push(
        underlyingToken[i].token.balanceOf(address(this)).sub(oldBalances[i])
      );
    }

    lastRedeemedAt = block.timestamp;
    currentRedeemBatchId = _generateNextWithdrawalBatchId(currentRedeemBatchId);
  }

  /* ========== RESTRICTED FUNCTIONS ========== */

  /*function addTokenSet(TokenSet tokenSet_) public onlyOwner {
    require(address(tokenSet_.setToken) != address(0));
    require(tokenSet_.underlying.length > 0);
    require(
      tokenSet_.allocation.length > 0 &&
        tokenSet_.allocation.length == tokenSet_.underlying.length
    );
    require(
      tokenSet_.yearnVaults.length > 0 &&
        tokenSet_.yearnVaults.length == tokenSet_.underlying.length
    );
    require(
      tokenSet_.curveMetapools.length > 0 &&
        tokenSet_.curveMetaPools.length == tokenSet_.underlying.length
    );
    tokenSets.push(tokenSet_);
    emit TokenSetAdded(setToken_);
  }*/

  function _deposit(uint256 amount_, bytes32 currentBatchId) internal {
    batches[currentBatchId].unclaimedShares = batches[currentBatchId]
    .unclaimedShares
    .add(amount_);
    batches[currentBatchId].shareBalance[msg.sender] = batches[currentBatchId]
    .shareBalance[msg.sender]
    .add(amount_);
    emit Deposit(msg.sender, amount_);
  }

  function _claim(
    uint256 shares_,
    uint256 unclaimedShares_,
    uint256 batchBalance_,
    IERC20 token_
  ) internal returns (uint256) {
    uint256 claimableToken = batchBalance_.mul(shares_).div(unclaimedShares_);
    token_.approve(address(this), claimableToken);
    token_.safeTransferFrom(address(this), msg.sender, claimableToken);
    return claimableToken;
  }

  function _sendToCurve(uint256 amount_, CurveMetapool curveMetapool_)
    internal
    returns (uint256)
  {
    threeCrv.safeIncreaseAllowance(address(curveMetapool_), amount_);
    uint256[2] memory curveDepositAmounts = [
      0, // USDX
      amount_ // 3Crv
    ];
    return curveMetapool_.add_liquidity(curveDepositAmounts, 0);
  }

  function _sendToYearn(
    uint256 amount_,
    IERC20 yToken_,
    YearnVault yearnVault_
  ) internal {
    yToken_.safeIncreaseAllowance(address(yearnVault_), amount_);
    yearnVault_.deposit(amount_);
  }

  function _generateNextWithdrawalBatchId(bytes32 currentBatchId_)
    internal
    returns (bytes32)
  {
    return keccak256(abi.encodePacked(block.timestamp, currentBatchId_));
  }

  /* ========== SETTER ========== */

  function setUnderylingToken(UnderlyingToken[] calldata underlyingToken_)
    external
  {
    for (uint256 i; i < underlyingToken_.length; i++) {
      underlyingToken.push(underlyingToken_[i]);
    }
  }

  /* ========== MODIFIER ========== */
}
