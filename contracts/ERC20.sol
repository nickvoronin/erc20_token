pragma solidity ^0.5.0;


contract Erc20Compliant {
    // required:
    function totalSupply() public view returns (uint256);
    function balanceOf(address tokenOwner) public view returns (uint256 balance);
    function transfer(address to, uint256 value) public returns (bool success);
//    function transferFrom(address from, address to, uint256 tokens) public returns (bool);
//    function approve(address spender, uint256 tokens) public returns (bool);
//    function allowance(address tokenOwner, address spender) public returns (bool);

    // optional:
    string public name;
    string public symbol;
    uint8 public decimals;
}

contract HelloWorldToken is Erc20Compliant {
    mapping(address => uint256) balances;
    uint256 _totalSupply;

    constructor(
        uint256 mintTotal,
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals
    ) public {
        _totalSupply = mintTotal;
        balances[msg.sender] = _totalSupply;
        name = tokenName;
        decimals = tokenDecimals;
        symbol = tokenSymbol;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view returns (uint256) {
        return balances[owner];
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf(msg.sender) >= value);
        balances[msg.sender] -= value;
        balances[to] += value;
        return true;
    }
}