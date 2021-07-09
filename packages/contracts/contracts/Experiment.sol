pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Experiment {
  using SafeMath for uint256;

  uint256[] public items = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19
  ];
  uint256[] public sample;

  constructor() {}

  function addItem(uint256 item) public {
    items.push(item);
  }

  function deleteItems(uint256 modulo, uint256 stop) public {
    uint256 total;
    for (uint256 index = items.length; index > stop; index--) {
      uint256 item = items[index - 1];
      if (item % modulo == 0) {
        sample.push(item);
        delete items[index - 1];
      }
    }
  }

  function clearSample() public {
    delete sample;
  }

  function getItems() public view returns (uint256[] memory) {
    return items;
  }

  function getSample() public view returns (uint256[] memory) {
    return sample;
  }
}
