// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
}

contract Zapper {
  using SafeERC20 for IERC20;

  CurveAddressProvider public curveAddressProvider;
  CurveRegistry public curveRegistry;

  constructor(address curveAddressProvider_) {
    curveAddressProvider = CurveAddressProvider(curveAddressProvider_);
    curveRegistry = CurveRegistry(curveAddressProvider.get_registry());
  }

  function token(address popcornPool) public view returns (address) {
    return address(IPool(popcornPool).token());
  }

  function curvePoolAddress(address popcornPool) public view returns (address) {
    return curveRegistry.get_pool_from_lp_token(token(popcornPool));
  }

  function depositTokens(address popcornPool) public view returns (address[8] memory) {
    return curveRegistry.get_underlying_coins(curvePoolAddress(popcornPool));
  }

  function canZap(address popcornPool, address token) public view returns (bool) {
    require(address(token) != address(0));
    bool supported = false;
    address[8] memory supportedTokens = depositTokens(popcornPool);
    for (uint8 i=0; i < supportedTokens.length; i++) {
      if (address(supportedTokens[i]) == address(token)) {
        supported = true;
        break;
      }
    }
    return supported;
  }

}
