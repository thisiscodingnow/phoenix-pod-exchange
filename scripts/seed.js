const hre = require("hardhat")

function tokens(n) {
  return hre.ethers.parseUnits(n.toString(), 18)
}

function wait(seconds) {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
  // Deployed contract addresses (from `npx hardhat ignition deploy` on this node)
  const PHXP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  const mUSDC_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  const mLINK_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  const EXCHANGE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  const FLASH_LOAN_USER_ADDRESS = "0x663F3ad617193148711d28f5334eE4Ed07016602"

  const phxp = await hre.ethers.getContractAt("Token", PHXP_ADDRESS)
  console.log(`Token fetched: ${await phxp.getAddress()}`)

  const mUSDC = await hre.ethers.getContractAt("Token", mUSDC_ADDRESS)
  console.log(`Token fetched: ${await mUSDC.getAddress()}`)

  const mLINK = await hre.ethers.getContractAt("Token", mLINK_ADDRESS)
  console.log(`Token fetched: ${await mLINK.getAddress()}`)

  const exchange = await hre.ethers.getContractAt("Exchange", EXCHANGE_ADDRESS)
  console.log(`Exchange fetched: ${await exchange.getAddress()}\n`)

  const flashLoanUser = await hre.ethers.getContractAt("FlashLoanUser", FLASH_LOAN_USER_ADDRESS)
  console.log(`Flash Loan User fetched: ${await flashLoanUser.getAddress()}\n`)

  // Unlocked accounts from the local node
  const accounts = await hre.ethers.getSigners()
  const deployer = accounts[0]  // deploys + holds initial supply
  const collector = accounts[1] // collects exchange fees
  const user1 = accounts[2]
  const user2 = accounts[3]

  // ---
  // Distribute tokens to the users
  // ---
  const AMOUNT = 100000
  let transaction, result

  transaction = await phxp.connect(deployer).transfer(user1.address, tokens(AMOUNT))
  await transaction.wait()
  console.log(`Transferred ${AMOUNT} PHXP from ${deployer.address} to ${user1.address}\n`)

  transaction = await mUSDC.connect(deployer).transfer(user2.address, tokens(AMOUNT))
  await transaction.wait()
  console.log(`Transferred ${AMOUNT} mUSDC from ${deployer.address} to ${user2.address}\n`)

  // ---
  // Users deposit their tokens into the exchange
  // ---
  transaction = await phxp.connect(user1).approve(await exchange.getAddress(), tokens(AMOUNT))
  await transaction.wait()
  console.log(`Approved ${AMOUNT} PHXP from ${user1.address}`)

  transaction = await exchange.connect(user1).depositToken(PHXP_ADDRESS, tokens(AMOUNT))
  await transaction.wait()
  console.log(`Deposited ${AMOUNT} PHXP from ${user1.address}\n`)

  transaction = await mUSDC.connect(user2).approve(await exchange.getAddress(), tokens(AMOUNT))
  await transaction.wait()
  console.log(`Approved ${AMOUNT} mUSDC from ${user2.address}`)

  transaction = await exchange.connect(user2).depositToken(mUSDC_ADDRESS, tokens(AMOUNT))
  await transaction.wait()
  console.log(`Deposited ${AMOUNT} mUSDC from ${user2.address}\n`)

  // ---
  // Seed a cancelled order
  // ---
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(1), PHXP_ADDRESS, tokens(1))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  orderId = result.logs[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  await wait(1)

  // ---
  // Seed a few filled orders
  // ---
  for (let i = 1; i <= 3; i++) {
    transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10), PHXP_ADDRESS, tokens(10 * i))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    orderId = result.logs[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user2.address}\n`)

    await wait(1)
  }

  // ---
  // Seed open orders — user1 selling PHXP for mUSDC
  // ---
  for (let i = 1; i <= 5; i++) {
    transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10 * i), PHXP_ADDRESS, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)
    await wait(1)
  }

  // ---
  // Seed open orders — user2 buying PHXP with mUSDC
  // ---
  for (let i = 1; i <= 5; i++) {
    transaction = await exchange.connect(user2).makeOrder(PHXP_ADDRESS, tokens(10), mUSDC_ADDRESS, tokens(10 * i))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}`)
    await wait(1)
  }

  // ---
  // Perform some flash loans
  // ---
  for (let i = 0; i < 3; i++) {
    transaction = await flashLoanUser.connect(user1).getFlashLoan(PHXP_ADDRESS, tokens(1000))
    result = await transaction.wait()
    console.log(`Flash loan executed from ${user1.address}`)
    await wait(1)
  }

  console.log("Seeding complete ✅")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
