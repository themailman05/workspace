pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface PopcornPool {
  function deposit(uint256 amount) external returns (uint256);
  function withdraw(uint256 amount) external returns (uint256, uint256);
}

contract MockFlashLoan {
  PopcornPool pool;
  IERC20     dai;

  constructor (address _poolAddress, address _dai) {
    pool = PopcornPool(_poolAddress);
    dai = IERC20(_dai);
  }

  function doFlashLoan () public {
    dai.approve(address(pool), 1000 ether);
    uint256 poolShares = pool.deposit(1000 ether);
    pool.withdraw(poolShares);
  }
}