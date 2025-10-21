"use client";

import React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const endpoint = "http://127.0.0.1:8899";
  const wallets = [new UnsafeBurnerWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppBar />
          <main className="p-6">{children}</main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

function AppBar() {
  return (
    <header className="flex justify-between items-center px-6 py-1 shadow-md text-white">
      <h1 className="text-3xl font-extrabold tracking-wide">FlipCoin</h1>
      <div className="flex gap-2 items-center">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
    </header>
  );
}

export default MainLayout;
