# Phoenix Pod Exchange

A decentralized token exchange (DEX) on Ethereum — ERC-20 token, on-chain order book, deposits and withdrawals, order matching, and flash loans — built with Solidity and Hardhat.

> **Status: 🚧 in active development.** Built following the Dapp University Blockchain Bootcamp (V3), branded as Phoenix Pod Exchange. The contracts are being built and tested lesson by lesson; my own modifications beyond the course are documented here and in the commit history as they land.

## Tech stack

- **Solidity** 0.8.28
- **Hardhat** + Hardhat Ignition (build, test, deploy)
- **Ethers.js**
- Frontend — React / Next.js / Redux (Part 2, coming)

## Progress

- [x] **ERC-20 Token** — name, symbol, decimals, total supply, balances (5 tests passing)
- [ ] Token transfers, approvals, delegated transfers
- [ ] Exchange — deposits, withdrawals, make/cancel/fill orders
- [ ] Flash loans
- [ ] Trading UI

## Run the tests

```bash
npm install
npx hardhat test
```

---

Built by **Nathan Mascreen** · [github.com/thisiscodingnow](https://github.com/thisiscodingnow)
