// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./MockERC20.sol";

contract MockCurveMetapool {
<<<<<<< HEAD
  MockERC20 lpToken;
  MockERC20 token;
  MockERC20 threeCrv;
  MockERC20 dai;
  MockERC20 usdc;
  MockERC20 usdt;

=======
  using SafeERC20 for MockERC20;

  MockERC20 public lpToken;
  MockERC20 public threeCrv;
>>>>>>> Basic BatchSetInteraction + Tests done
  uint256 virtualPrice = 1e18;

  uint256 withdrawalSlippageBps = 10;

  uint256 BPS_DENOMINATOR = 10000;
  MockERC20[] tokens;

  constructor(
    address token_,
    address lpToken_,
    address threeCrv_,
    address dai_,
    address usdc_,
    address usdt_
  ) {
    token = MockERC20(token_);
    lpToken = MockERC20(lpToken_);
    threeCrv = MockERC20(threeCrv_);
    dai = MockERC20(dai_);
    usdc = MockERC20(usdc_);
    usdt = MockERC20(usdt_);
    tokens = [token, threeCrv];
  }

  function coins() external view returns (address[2] memory) {
    address[2] memory coins = [address(token), address(threeCrv)];
    return coins;
  }

  function base_coins() external view returns (address[3] memory) {
    address[3] memory coins = [address(dai), address(usdc), address(usdt)];
    return coins;
  }

  function get_virtual_price() external view returns (uint256) {
    return virtualPrice;
  }

  function add_liquidity(uint256[2] calldata amounts, uint256 min_mint_amounts)
    external
    returns (uint256)
  {
<<<<<<< HEAD
    uint256 lpTokens;
    for (uint8 i = 0; i < tokens.length; i++) {
      tokens[i].transferFrom(msg.sender, address(this), amounts[i]);
      lpToken.mint(msg.sender, amounts[i]);
      lpTokens += amounts[i];
    }
    return lpTokens;
=======
    threeCrv.transferFrom(msg.sender, address(this), amounts[1]);
    require(amounts[1] > min_mint_amounts, "amount lower min");
    lpToken.mint(msg.sender, amounts[1]);
    return amounts[1];
>>>>>>> Basic BatchSetInteraction + Tests done
  }

  function remove_liquidity_one_coin(
    uint256 amount,
    int128 i, //index if the coin to withdraw
    uint256 min_underlying_amount
  ) external returns (uint256) {
    lpToken.transferFrom(msg.sender, address(this), amount);

    uint256 slippage = (amount * withdrawalSlippageBps) / 10000;
    uint256 transferOut = amount - slippage;

    uint256 i = uint256(i);
    tokens[i].approve(address(this), transferOut);
    tokens[i].mint(address(this), transferOut);
    tokens[i].transferFrom(address(this), msg.sender, transferOut);
    return transferOut;
  }

  // Test helpers

  function setVirtualPrice(uint256 virtualPrice_) external {
    virtualPrice = virtualPrice_;
  }

  function setWithdrawalSlippage(uint256 withdrawalSlippageBps_) external {
    withdrawalSlippageBps = withdrawalSlippageBps_;
  }
}
