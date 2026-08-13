// CSS
import "./globals.css";

// Fonts
import { Lexend } from 'next/font/google'
const lexend = Lexend({ subsets: ['latin'] })

// Components
import StoreProvider from "./components/providers/StoreProvider"
import MetaMaskProvider from "./components/providers/MetaMaskProvider"
import SideNav from './components/SideNav'
import TopNav from './components/TopNav'

export const metadata = {
  title: "Phoenix Pod Exchange",
  description: "A peer-to-peer order book exchange — Phoenix Pod",
};

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <MetaMaskProvider>
        <html lang="en">
          <body className={`${lexend.className}`}>
            <SideNav />

            <main className="content">
              <TopNav />
              {children}
            </main>
          </body>
        </html>
      </MetaMaskProvider>
    </StoreProvider>
  );
}
