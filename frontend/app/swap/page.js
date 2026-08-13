"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"

// Import components
import Chart from "@/app/components/Chart"

// Import assets
import arrow from "@/app/assets/arrows/arrow-down.svg"
import mask from "@/app/assets/mask.svg"

// Redux
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setOrderToFill } from "@/lib/features/exchange/exchange"
import { selectMarket, selectOrderToFill, selectPriceData } from "@/lib/selectors"

// Custom hooks
import { useProvider } from "../hooks/useProvider"
import { useExchange } from "../hooks/useExchange"

export default function Home() {
  // Local state
  const [gasFee, setGasFee] = useState(0)

  // Redux
  const dispatch = useAppDispatch()
  const market = useAppSelector(selectMarket)
  const order = useAppSelector(selectOrderToFill)
  const priceData = useAppSelector(selectPriceData)

  // Hooks
  const router = useRouter()
  const { provider } = useProvider()
  const { exchange } = useExchange()

  // Handlers
  async function fillHandler() {
    try {
      // Get signer
      const signer = await provider.getSigner()

      // Submit transaction
      const transaction = await exchange.connect(signer).fillOrder(order.id)
      await transaction.wait()

      // Clear order to fill
      dispatch(setOrderToFill(null))

      // Navigate back to the /wallet page
      router.push("/wallet")
    } catch (error) {
      // On an error, clear the order to fill
      // and route back to the trading page
      dispatch(setOrderToFill(null))
      router.push("/")
    }
  }

  async function estimateFees() {
    const { maxFeePerGas } = await provider.getFeeData()
    const gasUsage = await exchange.fillOrder.estimateGas(order.id)
    setGasFee(gasUsage * maxFeePerGas)
  }

  useEffect(() => {
    if (provider && exchange && order) {
      estimateFees()
    }
  }, [provider, exchange, order])

  return (
    <div className="page swapping">
      <h1 className="title">Swap</h1>

      {order && market && (
        <section className="swap">
          <form action={fillHandler}>
            <div className="inputs">

              <div className="input">
                <label htmlFor="">Sell</label>
                <input type="number" value={ethers.formatUnits(order.amountGet, 18)} disabled />

                <div className="select">
                  <select name="sell" id="sell" disabled>
                    <option value="0">
                      {order.type === "buy" ? market[0].symbol : market[1].symbol}
                    </option>
                  </select>
                </div>
              </div>

              <div className="arrow">
                <Image src={arrow} alt="Arrow down" />
              </div>

              <div className="input">
                <label htmlFor="">Buy</label>
                <input type="number" value={ethers.formatUnits(order.amountGive, 18)} disabled />

                <div className="select">
                  <select name="buy" id="buy" disabled>
                    <option value="0">
                      {order.type === "buy" ? market[1].symbol : market[0].symbol}
                    </option>
                  </select>
                </div>
              </div>

            </div>

            <input type="submit" />

            <div className="fees">
              <div className="fee">
                <p>Gas Fee</p>
                <p>{Number(ethers.formatUnits(gasFee, 18)).toFixed(5)} ETH</p>
              </div>
              <div className="fee">
                <p>Swap Fee</p>
                <p>0.00125 ETH</p>
              </div>
              <div className="fee">
                <p>Amount Received</p>
                <p>
                  {/* 
                    Remember that the user who made the order
                    is giving the user X token. Thus this is
                    what is being received.
                  */}

                  {ethers.formatUnits(order.amountGive, 18)}
                  &nbsp;
                  {order.type === "buy" ? market[1].symbol : market[0].symbol}
                </p>
              </div>
            </div>

            <Link href="/" className="cancel">Cancel swap</Link>
          </form>
        </section>
      )}

      {order && market && (
        <section className="insights">
          <Chart market={market} data={priceData} />
        </section>
      )}

      {!order && (
        <section className="placeholder">
          <Image src={mask} alt="Swap logo" />

          <h2>Please select an order to fill</h2>

          <Link href="/" className="button">Select Now</Link>
        </section>
      )}
    </div>
  );
}
