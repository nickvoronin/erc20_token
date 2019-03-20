pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


interface Erc20Compliant {
    // required:
    function totalSupply() external view returns (uint256);
    function balanceOf(address tokenOwner) external view returns (uint256 balance);
    function transfer(address to, uint256 value) external returns (bool success);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external returns (uint256 remaining);
}

contract HelloWorldToken is Erc20Compliant {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) internal balances_;
    mapping(address => mapping(address => uint256)) internal allowed_;
    uint256 internal totalSupply_;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event Approve(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        uint256 _mintTotal,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint8 _tokenDecimals
    ) public {
        totalSupply_ = _mintTotal;
        balances_[msg.sender] = totalSupply_;
        name = _tokenName;
        decimals = _tokenDecimals;
        symbol = _tokenSymbol;
    }

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() external view returns (uint256) {
        return totalSupply_;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return A uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) external view returns (uint256) {
        return balances_[owner];
    }
    /**
    * @dev Transfer token to a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(address to, uint256 value) external returns (bool success) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner, address spender) external returns (uint256 remaining) {
        return allowed_[owner][spender];
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another.
     * Note that while this function emits an Approval event, this is not required as per the specification,
     * and other compliant implementations may not emit the event.
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowedSpendings = allowed_[from][msg.sender];
        require(allowedSpendings >= value);

        _approve(from, msg.sender, allowed_[from][msg.sender].sub(value));

        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal {
        require(balances_[from] >= value);
        require(to != address(0));

        balances_[from] = balances_[from].sub(value);
        balances_[to] = balances_[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev Approve an address to spend another addresses' tokens.
     * @param owner The address that owns the tokens.
     * @param spender The address that will spend the tokens.
     * @param value The number of tokens that can be spent.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0));
        require(spender != address(0));

        allowed_[owner][spender] = value;
        emit Approve(owner, spender, value);
    }
}