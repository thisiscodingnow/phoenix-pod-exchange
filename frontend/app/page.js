"use client"

import { useEffect, useRef, useState } from "react"
import { ethers } from "ethers"

// Import components
import Market from "@/app/components/Market"
import Book from "@/app/components/Book"
import Orders from "@/app/components/Orders"
import Tabs from "@/app/components/Tabs"
import Chart from "@/app/components/Chart"

export default function Home() {
  return (
    <div className="page trading">
      <h1 className="title">Trading</h1>

      <section className="insights">
        <Chart />
      </section>

      <section className="market">
        <h2>Select Market</h2>

        <Market />
      </section>

      <section className="order">
        <h2>New Order</h2>

        <Tabs/>

        <form>

        </form>

      </section>

      <section className="orderbook">
        <h2>Orderbook</h2>

        <Book />
      </section>

      <section className="orders">
        <h2>My Trades</h2>

        <Tabs/>

        <Orders/>
      </section>

      <section className="transactions">
        <h2>Trades</h2>

        <Orders/>
      </section>

    </div>
  );
}
