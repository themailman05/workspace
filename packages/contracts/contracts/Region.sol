pragma solidity >=0.7.0 <0.8.0;

import "./Governed.sol";
import "./IRegion.sol";

contract Region is IRegion, Governed {
  string[] public regions;
  mapping(string => bool) public regionExists;

  event RegionAdded(string region);

  constructor() public Governed(msg.sender) {}

  function addRegion(string region) external override onlyGovernance {
    require(regionExists[region] == false, "region already exists");
    languages.push(region);
    regionExists[region] = true;
    emit RegionAdded(region);
  }
}
