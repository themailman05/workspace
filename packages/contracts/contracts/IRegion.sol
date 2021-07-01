pragma solidity >=0.7.0 <0.8.0;

import "./Governed.sol";

contract Region is Governed {
  function regionExists(string region) external view returns (bool);

  function regions() external view returns (string[]);

  function addRegion(string region) external;
}
