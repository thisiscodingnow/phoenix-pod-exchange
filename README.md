# Phoenix Pod Exchange

[![CI](https://github.com/thisiscodingnow/phoenix-pod-exchange/actions/workflows/test.yml/badge.svg)](https://github.com/thisiscodingnow/phoenix-pod-exchange/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack **decentralized exchange (DEX)** on Ethereum — an ERC-20 token, an on-chain order-book exchange with deposits, withdrawals, and order matching, flash loans, and a complete React/Next.js trading interface.

Smart contracts in Solidity + Hardhat; a Next.js 15 / Redux / ethers.js front end that connects a wallet, reads the chain, and lets you place, cancel, and fill orders against a live order book.

> **Origin & attribution.** Built following the Dapp University Blockchain Bootcamp (V3), then branded and extended as **Phoenix Pod Exchange**. The contracts and UI were built lesson by lesson; my own modifications beyond the course — rebranding, bug fixes, and an SSR correction — are documented below and traceable in the per-lesson commit history.

---

## What it does

**Smart contracts**
- **PHXP** — a complete ERC-20 (`transfer`, `approve`, `transferFrom`, allowances)
- **Exchange** — deposit/withdraw tokens, make / cancel / fill limit orders on an on-chain order book, with maker/taker fees and balance-locking for open orders
- **Flash loans** — uncollateralized, single-transaction loans (borrow → use → repay-or-revert) via an inheritable `FlashLoanProvider`

**Trading interface**
- Wallet connect + sign-in, in-app network switcher (MetaMask SDK)
- Live wallet & exchange balances; deposit / withdraw forms
- Market selector, candlestick **price chart** (ApexCharts)
- Live **order book** (buy/sell), **trades** feed, and per-user **My Orders / My Trades** tabs
- Place **buy/sell orders**, **cancel** your own, and **fill** others' via a swap-style confirmation with gas estimate
- Flash-loan history, all updated live via contract event listeners

## Tech stack

| Layer | Tools |
|-------|-------|
| Contracts | Solidity 0.8.28, Hardhat, Hardhat Ignition |
| Testing | Hardhat + Chai (41 passing tests) |
| Front end | Next.js 15, React 18, Redux Toolkit + Reselect, ethers 6 |
| Wallet / data | @metamask/sdk-react, ApexCharts, Jazzicon, Moment, Lodash |

## Repository layout

```
├── contracts/        Solidity sources (Token, Exchange, FlashLoanProvider, FlashLoanUser)
├── test/             Hardhat test suite (41 passing)
├── ignition/         Hardhat Ignition deploy modules
├── scripts/seed.js   Seeds a local chain with balances, orders, trades, flash loans
└── frontend/         Next.js trading interface
```

## Run it locally

**1 — Contracts + a seeded local chain**

```bash
npm install
npx hardhat test                     # 41 passing

npx hardhat node                     # terminal 1: local chain on :8545
```

In a second terminal, deploy and seed (addresses are deterministic and match the front end's config):

```bash
npx hardhat ignition deploy ignition/modules/Token.js --network localhost
npx hardhat ignition deploy ignition/modules/Exchange.js --network localhost
npx hardhat ignition deploy ignition/modules/FlashLoanUser.js --network localhost
npx hardhat run scripts/seed.js --network localhost
```

**2 — Front end**

```bash
cd frontend
npm install
npm run dev                          # http://localhost:3000
```

**3 — Wallet** — in MetaMask, add a network (RPC `http://127.0.0.1:8545`, chain ID `31337`), import one of the Hardhat test accounts, connect, and select the **PHXP / mUSDC** market.

> Runs against a local Hardhat node today. Public testnet + hosted demo deployment are the next step.

## What I changed beyond the course

- **Rebranded the native token** to **Phoenix Pod Token (PHXP)** — applied across deploy scripts, tests, and the UI, keeping realistic mock counter-assets (mUSDC, mLINK).
- **Phoenix Pod branding** throughout, including a custom logo cropped from my own brand mark for the nav and favicon.
- **Fixed a real SSR bug** in the price chart: the course placed `{ ssr: false }` inside `import()` (where it's ignored) instead of as `dynamic()`'s second argument — corrected so the ApexCharts import is truly client-only.
- **Fixed several bootcamp bugs** — a duplicated test name, an assertion that checked nothing, and a misspelled revert string (`Insufficent` → `Insufficient`) across contracts and tests.
- Wired the front end to the project's **own compiled ABIs** (including the flash-loan functions the course baseline omits).

---

Built by **Nathan Mascreen** · [github.com/thisiscodingnow](https://github.com/thisiscodingnow)
