// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import {Exchange} from "./Exchange.sol";
import {IFlashLoanReceiver} from "./FlashLoanProvider.sol";

// The borrower side: requests a flash loan and repays it in the callback.
contract FlashLoanUser is IFlashLoanReceiver {
    address exchange;

    event FlashLoanReceived(address token, uint256 amount);

    constructor(address _exchange) {
        exchange = _exchange;
    }

    function getFlashLoan(address _token, uint256 _amount) external {
        // Request the flash loan from the exchange (empty _data for now)
        Exchange(exchange).flashLoan(_token, _amount, "");
    }

    // Called back by the exchange mid-loan; must repay before returning.
    function receiveFlashLoan(
        address _token,
        uint256 _amount,
        bytes memory /* _data */
    ) external {
        // Only the exchange may trigger this callback
        require(msg.sender == exchange, "FlashLoanUser: Not Exchange contract");

        // Do something with the borrowed funds (here: just report the balance)
        emit FlashLoanReceived(_token, Token(_token).balanceOf(address(this)));

        // Repay the loan
        require(
            Token(_token).transfer(exchange, _amount),
            "FlashLoanUser: Token transfer failed"
        );
    }
}
