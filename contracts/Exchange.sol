// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

contract Exchange {
    // State variables
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // The order book: id => Order
    mapping(uint256 => Order) public orders;
    // Which orders have been cancelled: id => cancelled?
    mapping(uint256 => bool) public isOrderCancelled;

    // Total tokens belonging to a user: token => user => balance
    mapping(address => mapping(address => uint256))
        private userTotalTokenBalance;
    // Tokens locked in a user's open orders: token => user => balance
    mapping(address => mapping(address => uint256))
        private userActiveTokenBalance;

    // Events
    event TokensDeposited(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event TokensWithdrawn(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event OrderCreated(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event OrderCancelled(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct Order {
        uint256 id;         // Unique identifier for the order
        address user;       // User who made the order
        address tokenGet;   // Token they want to receive
        uint256 amountGet;  // Amount they want to receive
        address tokenGive;  // Token they are giving
        uint256 amountGive; // Amount they are giving
        uint256 timestamp;  // When the order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // ------------------------
    // DEPOSIT & WITHDRAW TOKEN

    function depositToken(address _token, uint256 _amount) public {
        // Update user balance (effects before interaction — CEI order)
        userTotalTokenBalance[_token][msg.sender] += _amount;

        // Emit an event
        emit TokensDeposited(
            _token,
            msg.sender,
            _amount,
            userTotalTokenBalance[_token][msg.sender]
        );

        // Transfer tokens into the exchange; revert the whole tx if it fails
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
            "Exchange: Token transfer failed"
        );
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Withdrawable = total deposited minus what's locked in open orders
        require(
            totalBalanceOf(_token, msg.sender) -
                activeBalanceOf(_token, msg.sender) >=
                _amount,
            "Exchange: Insufficient balance"
        );

        // Update the user balance (effects before interaction — CEI order)
        userTotalTokenBalance[_token][msg.sender] -= _amount;

        // Emit event
        emit TokensWithdrawn(
            _token,
            msg.sender,
            _amount,
            userTotalTokenBalance[_token][msg.sender]
        );

        // Transfer tokens back to the user
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Exchange: Token transfer failed"
        );
    }

    function totalBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userTotalTokenBalance[_token][_user];
    }

    function activeBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userActiveTokenBalance[_token][_user];
    }

    // ------------------------
    // MAKE & CANCEL ORDERS

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        // Must have enough free (unlocked) balance to back the order
        require(
            totalBalanceOf(_tokenGive, msg.sender) >=
                activeBalanceOf(_tokenGive, msg.sender) + _amountGive,
            "Exchange: Insufficient balance"
        );

        // New order id (first order is 1 — id 0 stays a sentinel for "no order")
        orderCount++;

        // Store the order in the book
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // Lock the offered tokens against this order
        userActiveTokenBalance[_tokenGive][msg.sender] += _amountGive;

        // Emit event
        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

    function cancelOrder(uint256 _id) public {
        // Fetch the order from storage (a pointer to state, not a copy)
        Order storage order = orders[_id];

        // Order must exist (id 0 sentinel: a missing order has id == 0)
        require(order.id == _id, "Exchange: Order does not exist");

        // Only the order's owner may cancel it
        require(order.user == msg.sender, "Exchange: Not the owner");

        // Mark it cancelled (soft delete — order stays on-chain for history)
        isOrderCancelled[_id] = true;

        // Release the tokens this order had locked
        userActiveTokenBalance[order.tokenGive][order.user] -= order.amountGive;

        // Emit event
        emit OrderCancelled(
            order.id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            block.timestamp
        );
    }
}
