import { createSelector } from "reselect"
import { get } from "lodash"

// ------------------------------------------------------------------------------
// USER

// Account
export const selectAccount = state => get(state, "user.account", null)
export const selectETHBalance = state => get(state, "user.balance", 0)

// Tokens
export const selectTokens = state => get(state, "tokens.tokens", [])

// Balances
export const selectTokenBalances = state => get(state, "tokens.balances", {})

export const selectWalletBalances = createSelector(
  selectTokens,
  selectTokenBalances,
  (tokens, balances) => {
    return tokens.map((token) => {
      const walletBalance = balances[token.address] ? balances[token.address].wallet : 0

      return {
        symbol: token.symbol,
        balance: walletBalance
      }
    })
  }
)

export const selectExchangeBalances = createSelector(
  selectTokens,
  selectTokenBalances,
  (tokens, balances) => {
    return tokens.map((token) => {
      const exchangeBalance = balances[token.address] ? balances[token.address].exchange : 0

      return {
        symbol: token.symbol,
        balance: exchangeBalance
      }
    })
  }
)

export const selectTokenAndBalance = createSelector(
  selectTokens,
  selectTokenBalances,
  (state, address) => address,
  (tokens, balances, address) => {
    if (address === null) return { token: null, balances: { wallet: 0, exchange: 0 } }

    const token = tokens.find(token => token.address === address)
    const wallet = balances[address] ? balances[address].wallet : 0 
    const exchange = balances[address] ? balances[address].exchange : 0

    return { token, balances: { wallet, exchange } }
  }
)
