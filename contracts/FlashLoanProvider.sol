// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

// The borrower must implement this so the provider can call back into it.
interface IFlashLoanReceiver {
    function receiveFlashLoan(
        address token,
        uint256 amount,
        bytes memory data
    ) external;
}

// Abstract: never deployed on its own — the Exchange inherits it to gain
// flash-loan capability.
abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(
        address _token,
        uint256 _amount,
        bytes memory _data
    ) public {
        // Snapshot the balance before lending
        uint256 tokenBalanceBefore = Token(_token).balanceOf(address(this));

        // Must have something to lend
        require(
            tokenBalanceBefore > 0,
            "FlashLoanProvider: Insufficient funds to loan"
        );

        // Send the funds to the borrower (msg.sender)
        require(
            Token(_token).transfer(msg.sender, _amount),
            "FlashLoanProvider: Transfer failed"
        );

        // Hand control to the borrower to use the funds, then repay
        IFlashLoanReceiver(msg.sender).receiveFlashLoan(_token, _amount, _data);

        // Snapshot the balance after the callback returns
        uint256 tokenBalanceAfter = Token(_token).balanceOf(address(this));

        // The loan must be fully repaid — else revert the whole transaction
        require(
            tokenBalanceAfter >= tokenBalanceBefore,
            "FlashLoanProvider: Funds not received"
        );

        emit FlashLoan(_token, _amount, block.timestamp);
    }
}
