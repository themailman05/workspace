pragma solidity >=0.7.0 <0.8.0;

import "./IRegion.sol";

// https://docs.synthetix.io/contracts/source/contracts/owned
contract CouncilControlled {
  IRegion internal region;
  mapping(string => address) private council;
  mapping(string => address) public nominatedCouncil;

  event CouncilNominated(string _region, address newCouncil);
  event CouncilChanged(string _region, address oldCouncil, address newCouncil);

  constructor(address _council, IRegion _region) public {
    require(_council != address(0), "Council address cannot be 0");
    council["ww"] = _council;
    region = _region;
  }

  function nominateNewCouncil(address _council, string _region)
    external
    onlyCouncil(_region)
  {
    nominatedCouncil[_region] = _council;
    emit CouncilNominated(_region, _council);
  }

  function acceptCouncil(string _region) external {
    require(
      msg.sender == nominatedCouncil[_region],
      "You must be nominated before you can accept council"
    );
    emit CouncilChanged(_region, council[_region], nominatedCouncil[_region]);
    council[_region] = nominatedCouncil[_region];
    nominatedCouncil = address(0);
  }

  function nominateFirstCouncil(address _council, string _region)
    external
    _onlyCouncil("ww")
  {
    require(region.regionExists(_region), "region doesnt exist");
    require(council[_region] == address(0), "region already has a council");
    nominatedCouncil[_region] = _council;
    emit CouncilNominated(_region, _council);
  }

  modifier onlyCouncil(string _region) {
    _onlyCouncil(_region);
    _;
  }

  function _onlyCouncil(string _region) private view {
    require(
      msg.sender == council[_region],
      "Only the contract council may perform this action"
    );
  }

  function getCouncil(string _region) public view returns (address) {
    return council[_region];
  }
}
