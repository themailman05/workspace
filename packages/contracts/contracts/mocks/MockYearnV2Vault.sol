// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockYearnV2Vault is ERC20 {

  ERC20 token;
  uint256 pricePerShareInToken;

  constructor(address token_)
    ERC20("Mock USDX yVault", "yvUSDX")
  {
    token = ERC20(token_);
  }

  function pricePerShare() external view returns (uint256) {
    return pricePerShareInToken;
  }

  function deposit(uint256 amount) external returns (uint256) {
    token.transferFrom(msg.sender, address(this), amount);
    uint256 shares = amount / pricePerShareInToken;
    _mint(msg.sender, shares);
  }

  // Test helpers

  function setPricePerShare(uint256 pricePerShare_) external {
    pricePerShareInToken = pricePerShare_;
  }

}
