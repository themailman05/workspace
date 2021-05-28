pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface PopcornPool is IERC20 {
  function deposit(uint256 amount) external returns (uint256);
  function withdraw(uint256 amount) external returns (uint256, uint256);
}

contract BlockLockHelper {
  PopcornPool pool;
  IERC20     dai;

  constructor (address _poolAddress, address _dai) {
    pool = PopcornPool(_poolAddress);
    dai = IERC20(_dai);
  }

  function deposit () public {
    dai.approve(address(pool), 1000 ether);
    pool.deposit(1000 ether);
  }

  function depositThenWithdraw () public {
    dai.approve(address(pool), 1000 ether);
    uint256 poolShares = pool.deposit(1000 ether);
    pool.withdraw(poolShares);
  }

  function withdrawThenDeposit () public {
    uint256 poolShares = pool.balanceOf(address(this));
    pool.withdraw(poolShares);
    dai.approve(address(pool), 500 ether);
    pool.deposit(500 ether);
  }
}