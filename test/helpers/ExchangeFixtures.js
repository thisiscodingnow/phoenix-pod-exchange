const { ethers } = require("hardhat")

async function deployExchangeFixture() {
  // Get contracts
  const Exchange = await ethers.getContractFactory("Exchange")
  const Token = await ethers.getContractFactory("Token")

  // Deploy token contracts
  const token0 = await Token.deploy("Dapp University", "DAPP", "1000000")
  const token1 = await Token.deploy("Mock Dai", "mDAI", "1000000")

  // Get accounts
  const accounts = await ethers.getSigners()
  const deployer = accounts[0]
  const feeAccount = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]

  const AMOUNT = ethers.parseUnits("100", 18)

  // Transfer 100 token0 to user1
  await (await token0.connect(deployer).transfer(user1.address, AMOUNT)).wait()

  // Transfer 100 token1 to user2
  await (await token1.connect(deployer).transfer(user2.address, AMOUNT)).wait()

  // Set the fee and deploy exchange
  const FEE_PERCENT = 10
  const exchange = await Exchange.deploy(feeAccount.address, FEE_PERCENT)

  return { tokens: { token0, token1 }, exchange, accounts: { deployer, feeAccount, user1, user2 } }
}

async function depositExchangeFixture() {
  const { tokens, exchange, accounts } = await deployExchangeFixture()

  const AMOUNT = ethers.parseUnits("100", 18)

  // Approve & deposit token0 for user1 — keep the tx to assert on the event
  await (await tokens.token0.connect(accounts.user1).approve(await exchange.getAddress(), AMOUNT)).wait()
  const transaction = await exchange.connect(accounts.user1).depositToken(await tokens.token0.getAddress(), AMOUNT)
  await transaction.wait()

  // Approve & deposit token1 for user2 — no tx needed for assertions
  await (await tokens.token1.connect(accounts.user2).approve(await exchange.getAddress(), AMOUNT)).wait()
  await (await exchange.connect(accounts.user2).depositToken(await tokens.token1.getAddress(), AMOUNT)).wait()

  return { tokens, exchange, accounts, transaction }
}

module.exports = {
    deployExchangeFixture,
    depositExchangeFixture
}
