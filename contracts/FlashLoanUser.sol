// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import {Exchange} from "./Exchange.sol";

// The borrower side: a contract that requests a flash loan from the Exchange.
contract FlashLoanUser {
    address exchange;

    constructor(address _exchange) {
        exchange = _exchange;
    }

    function getFlashLoan(address _token, uint256 _amount) external {
        // Request the flash loan from the exchange (empty _data for now)
        Exchange(exchange).flashLoan(_token, _amount, "");
    }
}
