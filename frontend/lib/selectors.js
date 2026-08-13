import { createSelector } from "reselect"
import { get } from "lodash"

// ------------------------------------------------------------------------------
// USER

// Account
export const selectAccount = state => get(state, "user.account", null)
export const selectETHBalance = state => get(state, "user.balance", 0)

