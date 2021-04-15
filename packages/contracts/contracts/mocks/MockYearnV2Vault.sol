// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import "./MockERC20.sol";

contract MockYearnV2Vault is MockERC20 {

  MockERC20 token;
  uint256 pricePerShareInToken;

  constructor(address token_)
    MockERC20("Mock USDX yVault", "yvUSDX")
  {
    token = MockERC20(token_);
  }

  function pricePerShare() external view returns (uint256) {
    return pricePerShareInToken;
  }

  function deposit(uint256 amount) external returns (uint256) {
    token.transferFrom(msg.sender, address(this), amount);
    uint256 shares = amount / pricePerShareInToken;
    _mint(msg.sender, shares);
  }

  function withdraw(uint256 amount) external returns (uint256) {
    _burn(msg.sender, amount);
    uint256 tokenAmount = amount * pricePerShareInToken;
    token.approve(address(this), tokenAmount);
    token.transferFrom(address(this), msg.sender, tokenAmount);
  }

  // Test helpers

  function setPricePerShare(uint256 pricePerShare_) external {
    pricePerShareInToken = pricePerShare_;
  }

}
