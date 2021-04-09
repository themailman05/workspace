// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockYearnV2Vault is ERC20 {

  ERC20 token;

  constructor(address token_)
    ERC20("Mock USDX yVault", "yvUSDX")
  {
    token = ERC20(token_);
  }

  function pricePerShare() external view returns (uint256) {
    return 0;
  }

  function deposit(uint256 amount) external returns (uint256) {
    token.transferFrom(msg.sender, address(this), amount);
  }

}
