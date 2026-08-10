// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

// Abstract: we never deploy this on its own — the Exchange inherits it
// to gain flash-loan capability. (Part 1: sends the loan + emits only;
// the repayment/callback logic lands in Lesson 15.)
abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(
        address _token,
        uint256 _amount,
        bytes memory _data
    ) public {
        // Send the money to the borrower (msg.sender)
        Token(_token).transfer(msg.sender, _amount);

        // TODO (Lesson 15): call back into the borrower to use the funds

        // TODO (Lesson 15): require the loan (+ fee) was paid back, else revert

        // Emit an event
        emit FlashLoan(_token, _amount, block.timestamp);
    }
}
