pragma solidity >=0.7.0 <0.8.0;

// https://docs.synthetix.io/contracts/source/contracts/owned
contract CouncilControlled {
  mapping(string => address) private council;
  mapping(string => address) public nominatedCouncil;
  string[] public languages;

  event CouncilNominated(string language, address newCouncil);
  event CouncilChanged(string language, address oldCouncil, address newCouncil);
  event LanguageAdded(string language);
  event LanguageDeleted(string language);

  constructor(address _council) public {
    require(_council != address(0), "Council address cannot be 0");
    council["en"] = _council;
    emit CouncilChanged(address(0), _council);
  }

  function nominateNewCouncil(address _council, string language)
    external
    onlyCouncil(language)
  {
    nominatedCouncil[language] = _council;
    emit CouncilNominated(language, _council);
  }

  function acceptCouncil(string language) external {
    require(
      msg.sender == nominatedCouncil[language],
      "You must be nominated before you can accept council"
    );
    emit CouncilChanged(
      language,
      council[language],
      nominatedCouncil[language]
    );
    council[language] = nominatedCouncil[language];
    nominatedCouncil = address(0);
  }

  function addLanguage(string language, address newCouncil) external {
    //TODO who has the right to add our delete new languages?
    require(
      msg.sender == council["en"],
      "Only the contract council may perform this action"
    );
    languages.push(language);
    council[language] = newCouncil;
    emit LanguageAdded(language);
  }

  function deleteLangauge(uint256 index) external {
    //TODO who has the right to add our delete new languages?
    require(
      msg.sender == council["en"],
      "Only the contract council may perform this action"
    );
    string language = languages[index];
    delete languages[index];
    delete council[language];
    delete nominatedCouncil[language];
    emit LanguageDeleted(language);
  }

  modifier onlyCouncil(string language) {
    _onlyCouncil(language);
    _;
  }

  function _onlyCouncil(string language) private view {
    require(
      msg.sender == council[language],
      "Only the contract council may perform this action"
    );
  }

  function getCouncil(string language) public view returns (address) {
    return council[language];
  }
}
