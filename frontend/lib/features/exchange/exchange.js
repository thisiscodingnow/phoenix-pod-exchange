import { createSlice } from "@reduxjs/toolkit"

import config from "@/app/config.json"

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    market: null
  },
  reducers: {
    setMarket: (state, action) => {
      state.market = action.payload
    }
  },
})

export const {
  setMarket
} = exchange.actions

export default exchange.reducer
