pragma solidity >=0.7.0 <0.8.0;

import "./IRegions.sol";

// https://docs.synthetix.io/contracts/source/contracts/owned
contract CouncilControlled {
  mapping(string => address) private council;
  mapping(string => address) public nominatedCouncil;

  event CouncilNominated(string region, address newCouncil);
  event CouncilChanged(string region, address oldCouncil, address newCouncil);

  constructor(address _council) public {
    require(_council != address(0), "Council address cannot be 0");
    council["ww"] = _council;
  }

  function nominateNewCouncil(address _council, string region)
    external
    onlyCouncil(region)
  {
    nominatedCouncil[region] = _council;
    emit CouncilNominated(region, _council);
  }

  function acceptCouncil(string region) external {
    require(
      msg.sender == nominatedCouncil[region],
      "You must be nominated before you can accept council"
    );
    emit CouncilChanged(region, council[region], nominatedCouncil[region]);
    council[region] = nominatedCouncil[region];
    nominatedCouncil = address(0);
  }

  function addRegion(string region, address newCouncil)
    external
    override
    onlyGovernance
  {
    //TODO who has the right to add our delete new regions?
    require(
      msg.sender == council["en"],
      "Only the contract council may perform this action"
    );
    regions.push(region);
    council[region] = newCouncil;
    emit regionAdded(region);
  }

  function deleteLangauge(uint256 index) external {
    //TODO who has the right to add our delete new regions?
    require(
      msg.sender == council["en"],
      "Only the contract council may perform this action"
    );
    string region = regions[index];
    delete regions[index];
    delete council[region];
    delete nominatedCouncil[region];
    emit regionDeleted(region);
  }

  modifier onlyCouncil(string region) {
    _onlyCouncil(region);
    _;
  }

  function _onlyCouncil(string region) private view {
    require(
      msg.sender == council[region],
      "Only the contract council may perform this action"
    );
  }

  function getCouncil(string region) public view returns (address) {
    return council[region];
  }
}
