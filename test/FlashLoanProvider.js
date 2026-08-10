const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

const { depositExchangeFixture } = require("./helpers/ExchangeFixtures")

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 18)
}

// Small, single-use fixture: deposit funds into the exchange, then deploy a
// borrower contract pointed at it.
async function flashLoanFixture() {
  const { tokens, exchange, accounts } = await loadFixture(depositExchangeFixture)

  const FlashLoanUser = await ethers.getContractFactory("FlashLoanUser")
  const flashLoanUser = await FlashLoanUser.connect(accounts.user1).deploy(await exchange.getAddress())

  return { tokens, exchange, accounts, flashLoanUser }
}

describe("FlashLoanProvider", () => {
  describe("Calling flashLoan from FlashLoanUser", () => {
    const AMOUNT = tokens(100)

    it("emits a FlashLoan event", async () => {
      const { tokens: { token0 }, exchange, accounts, flashLoanUser } = await loadFixture(flashLoanFixture)

      await expect(
        flashLoanUser.connect(accounts.user1).getFlashLoan(await token0.getAddress(), AMOUNT)
      ).to.emit(exchange, "FlashLoan")
    })
  })
})
