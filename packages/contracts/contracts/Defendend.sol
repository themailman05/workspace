pragma solidity >=0.7.0 <0.8.0;

import "./Governed.sol";


contract SettAccessControlDefended is Governed {
    mapping (address => bool) public approved;

    function approveContractAccess(address account) external {
        _onlyGovernance();
        approved[account] = true;
    }

    function revokeContractAccess(address account) external {
        _onlyGovernance();
        approved[account] = false;
    }

    modifier defend {
      _defend();
      _;
    }

    function _defend() internal view {
        require(approved[msg.sender] || msg.sender == tx.origin, "Access denied for caller");
    }
}