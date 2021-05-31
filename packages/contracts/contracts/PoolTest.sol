// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./mocks/MockERC20.sol";
import "./mocks/MockYearnV1Vault.sol";
import "./mocks/MockCurveDepositZap.sol";
import "./Pool.sol";

contract PoolTest is Pool {

  MockERC20 mockDai = new MockERC20("Mock DAI", "DAI");
  MockERC20 mockCrvLPToken = new MockERC20("Mock crvUSDX", "crvUSDX");
  MockYearnV1Vault mockYearnVault = new MockYearnV1Vault(address(mockCrvLPToken));
  MockCurveDepositZap mockCurveDepositZap = new MockCurveDepositZap(address(mockCrvLPToken), address(mockDai));
  address private constant mockRewardsManager = address(0xd3adb33f);

  constructor() Pool(address(mockDai), address(mockYearnVault), address(mockCurveDepositZap), mockRewardsManager) {}

  function echidna_check_withdrawal_fee() public returns (bool) {
    return(withdrawalFee >= 0);
  }

  function echidna_check_management_fee() public returns (bool) {
    return(withdrawalFee >= 0);
  }

  function echidna_check_performance_fee() public returns (bool) {
    return(withdrawalFee >= 0);
  }

  function echidna_check_token_HWM_greater_than_one() public returns (bool) {
    return(poolTokenHWM >= 1e18);
  }

  function echidna_check_token_HWM_increases() public returns (bool) {
    uint256 previousHWM = poolTokenHWM;
    _reportPoolTokenHWM();
    return(poolTokenHWM >= previousHWM);
  }

  function echidna_check_pool_token_value_is_value_of_one_token() public returns (bool) {
    return(pricePerPoolToken() == valueFor(1e18));
  }

  function echidna_check_total_supply_is_less_than_total_value() public returns (bool) {
    return(totalSupply() <= totalValue());
  }

  function echidna_check_fees_updated_at() public returns (bool) {
    return(feesUpdatedAt <= block.timestamp);
  }

  function echidna_check_yearn_share_value_greater_than_total_value() public returns (bool) {
    return(totalValue() <= _yearnShareValue(_yearnBalance()));
  }

  function echidna_check_curve_token_value_greater_than_total_value() public returns (bool) {
    return(totalValue() <= _crvLPTokenValue(_crvBalance()));
  }

  function echidna_check_curve_token_value_less_than_yearn_share_value() public returns (bool) {
    return( _crvLPTokenValue(_crvBalance()) <= _yearnShareValue(_yearnBalance()));
  }

  function echidna_check_fees_increase_pool_balance() public returns (bool) {
    uint256 previousPoolBalance = balanceOf(address(this));
    _takeFees();
    return(balanceOf(address(this)) >= previousPoolBalance);
  }

  function echidna_check_fees_increase_updated_at_timestamp() public returns (bool) {
    uint256 previousFeesUpdatedAt = feesUpdatedAt
    _takeFees();
    return(feesUpdatedAt > previousFeesUpdatedAt);
  }

}
