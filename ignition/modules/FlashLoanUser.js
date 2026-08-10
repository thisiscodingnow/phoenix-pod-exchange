const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UserModule", (m) => {
  // Account #0 is deployer, #1 is the fee account, #2 is a regular user
  const USER = m.getAccount(2)

  // The Exchange must already be deployed — set this to its deployed address
  const EXCHANGE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

  const flashLoanUser = m.contract(
    "FlashLoanUser",
    [EXCHANGE_ADDRESS],
    { from: USER }
  )

  return { flashLoanUser }
});
