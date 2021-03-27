// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;
import './ITokenManager.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/**
 * @title PrivateSale
 * @dev purchase vested tokens
 */
contract PrivateSale is Ownable {
    using SafeMath for uint256;

    ITokenManager public tokenManager;
    IERC20 public pop;
    IERC20 public usdc;
    address public treasury;
    uint256 public tokenPrice = 150000000000000000;
    uint256 public supply = 7500000 * 10e18;
    uint256 constant secondsInDay = 86400;

    mapping(address => bool) allowList;
    mapping(address => uint256) allowances;

    event TreasuryUpdated(address indexed _address);

    event AddressAllowed(address indexed _address, uint256 _allowance);

    event TokenPriceUpdated(uint256 indexed _price);

    event TokensPurchased(address indexed _address, uint256 indexed _amount);

    event SupplyUpdated(uint256 indexed _amount);

    constructor(
        address _tokenManager,
        address _usdc,
        address _pop,
        address _treasury,
        uint256 _supply
    ) {
        tokenManager = ITokenManager(_tokenManager);
        usdc = IERC20(_usdc); //get tokens
        pop = IERC20(_pop);
        treasury = _treasury;
        supply = _supply;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setSupply(uint256 _supply) external onlyOwner {
        supply = _supply;
        emit SupplyUpdated(_supply);
    }

    function allow(address _address, uint256 _allowance) external onlyOwner {
        allowList[_address] = true;
        allowances[_address] = _allowance;
        emit AddressAllowed(_address, _allowance);
    }

    function setPrice(uint256 _tokenPrice) external onlyOwner {
        tokenPrice = _tokenPrice;
        emit TokenPriceUpdated(_tokenPrice);
    }

    function purchase(uint256 _amount) public {
        require(allowList[msg.sender] == true, 'address not allowed');
        require(_amount >= uint256(25000).mul(10**6), 'minimum not met');

        uint256 _paid = _amount.mul(10**12);
        uint256 _popToReceive = _paid.div(tokenPrice);

        require(supply >= _popToReceive, 'not enough supply');
        require(allowances[msg.sender] >= _popToReceive, 'allowance exceeded');
        require(
            usdc.transferFrom(msg.sender, treasury, _amount),
            'transfer failed'
        );

        tokenManager.assignVested(
            msg.sender,
            _popToReceive,
            uint64(block.timestamp), // now
            uint64(block.timestamp.add(secondsInDay.mul(365))), // + 1 year
            uint64(block.timestamp.add(secondsInDay.mul(548))), // + 18 months
            true
        );

        supply = supply.sub(_popToReceive);
        allowances[msg.sender] = allowances[msg.sender].sub(_popToReceive);
        emit TokensPurchased(msg.sender, _popToReceive);
    }
}
