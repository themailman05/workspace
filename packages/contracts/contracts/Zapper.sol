// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface CurveDepositZap {
  function add_liquidity(
    address pool,
    uint256[4] calldata amounts,
    uint256 min_mint_amounts
  ) external returns (uint256);
}

interface CurveAddressProvider {
  function get_registry() external view returns (address);
}

interface CurveRegistry {
  function get_pool_from_lp_token(address lp_token)
    external
    view
    returns (address);

  function get_underlying_coins(address pool)
    external
    view
    returns (address[8] memory);
}

interface CurveMetapool {
  function get_virtual_price() external view returns (uint256);

  function add_liquidity(uint256[2] calldata amounts, uint256 min_mint_amounts)
    external
    returns (uint256);

  function remove_liquidity_one_coin(
    uint256 amount,
    int128 i,
    uint256 min_underlying_amount
  ) external returns (uint256);
}

interface IPool {
  function token() external view returns (address);
  function deposit(uint256 amount, address recipient) external returns (uint256);
}

contract Zapper {
  using SafeERC20 for IERC20;

  CurveDepositZap public curveDepositZap;
  CurveAddressProvider public curveAddressProvider;
  CurveRegistry public curveRegistry;

  constructor(address curveAddressProvider_, address curveDepositZap_) {
    curveDepositZap = CurveDepositZap(curveDepositZap_);
    curveAddressProvider = CurveAddressProvider(curveAddressProvider_);
    curveRegistry = CurveRegistry(curveAddressProvider.get_registry());
  }

  function token(address popcornPool) public view returns (address) {
    return address(IPool(popcornPool).token());
  }

  function curvePoolAddress(address popcornPool) public view returns (address) {
    return curveRegistry.get_pool_from_lp_token(token(popcornPool));
  }

  function depositTokens(address popcornPool)
    public
    view
    returns (address[8] memory)
  {
    return curveRegistry.get_underlying_coins(curvePoolAddress(popcornPool));
  }

  function canZap(address popcornPool, address token)
    public
    view
    returns (bool)
  {
    require(address(token) != address(0));
    return tokenIndex(popcornPool, token) != 9;
  }

  function tokenIndex(address popcornPool, address token)
    public
    view
    returns (uint8)
  {
    uint8 index = 9;
    address[8] memory supportedTokens = depositTokens(popcornPool);
    for (uint8 i = 0; i < supportedTokens.length; i++) {
      if (address(supportedTokens[i]) == address(token)) {
        index = i;
        break;
      }
    }
    return index;
  }

  function zapIn(
    address popcornPool,
    address depositToken,
    uint256 amount
  ) public returns (uint256) {
    require(canZap(popcornPool, depositToken), "Unsupported deposit token");

    IERC20(depositToken).transferFrom(msg.sender, address(this), amount);
    uint256[4] memory amounts = [
      uint256(0),
      uint256(0),
      uint256(0),
      uint256(0)
    ];
    amounts[tokenIndex(popcornPool, depositToken)] = amount;
    IERC20(depositToken).safeIncreaseAllowance(address(curveDepositZap), amount);
    uint256 lpTokens = curveDepositZap.add_liquidity(
      curvePoolAddress(popcornPool),
      amounts,
      0
    );
    IERC20(token(popcornPool)).safeIncreaseAllowance(popcornPool, lpTokens);
    uint256 shares = IPool(popcornPool).deposit(lpTokens, msg.sender);
    return shares;
  }
}
