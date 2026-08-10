const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenModule", (m) => {
  const TOTAL_SUPPLY = 1000000
  const DEPLOYER = m.getAccount(0)

  // Native token — Phoenix Pod Token (PHXP)
  const PHXP = m.contract(
    "Token",
    ["Phoenix Pod Token", "PHXP", TOTAL_SUPPLY],
    { from: DEPLOYER, id: "PHXP" }
  )

  // Mock counter-assets for the order book
  const mUSDC = m.contract(
    "Token",
    ["Mock USDC", "mUSDC", TOTAL_SUPPLY],
    { from: DEPLOYER, id: "mUSDC" }
  )

  const mLINK = m.contract(
    "Token",
    ["Mock LINK", "mLINK", TOTAL_SUPPLY],
    { from: DEPLOYER, id: "mLINK" }
  )

  return { PHXP, mUSDC, mLINK }
});
