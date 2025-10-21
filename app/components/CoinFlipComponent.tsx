"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createMemoInstruction } from "@solana/spl-memo";
import React, { useState, useEffect } from "react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getOrAddUserToDatabase } from "../actions/getOrAddUserToDatabase";
import UserDetail from "./UserDetail";

const PLATFORM_ADDRESS = new PublicKey(
  "DypfnKJyBN5TkGf4CWYTN4B2tU2tRPgSzfV1QYWdSJP7"
);

const PRESET_AMOUNTS = ["0.001", "0.01", "0.05", "0.1"];
type FLIP_OPTIONS = "Heads" | "Tails";
const FLIP_OPTIONS: FLIP_OPTIONS[] = ["Heads", "Tails"];

const FlipCoin = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [user, setUser] = useState<{ id: string; publicKey: string } | null>(
    null
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>(PRESET_AMOUNTS[0]);
  const [choice, setChoice] = useState<FLIP_OPTIONS | null>(null);

  useEffect(() => {
    async function initUser() {
      if (!wallet.publicKey) return;
      const user = await getOrAddUserToDatabase(wallet.publicKey.toBase58());
      setUser(user!);
      await getBalance();
    }
    initUser();
  }, [wallet.publicKey]);

  async function getBalance() {
    if (!wallet.publicKey) return;
    const bal = await connection.getBalance(wallet.publicKey);
    setBalance(bal / LAMPORTS_PER_SOL);
  }

  async function handleBet() {
    if (!choice) {
      alert("Select Heads or Tails first!");
      return;
    }
    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      alert("Enter a valid SOL amount");
      return;
    }
    if (!wallet.publicKey || !user) return;

    const tx = new Transaction();
    const lamports = solAmount * LAMPORTS_PER_SOL;
    const ix = SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: PLATFORM_ADDRESS,
      lamports,
    });
    const memoInstruction = createMemoInstruction(
      `${user.id} | ${choice} | ${parseFloat(amount) * LAMPORTS_PER_SOL} | ${
        wallet.publicKey
      }`
    );
    tx.add(ix, memoInstruction);

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction?.(tx);
    const signature = await connection.sendRawTransaction(
      signedTx!.serialize()
    );
    await connection.confirmTransaction(signature, "confirmed");
    alert("Bet submitted! Signature: " + signature);
    await getBalance();
    const res = await fetch("/api/bet", {
      method: "POST",
      body: JSON.stringify({ signature }),
      headers: { "Content-Type": "application/json" },
    });
    const jsonRes = await res.json();
    await getBalance();
    alert(jsonRes);
    console.log(jsonRes);
  }

  return (
    <div className="flex flex-col gap-y-4">
      <UserDetail balance={balance} setBalance={setBalance} />
      <div className="max-w-md text-center justify-center mx-auto">
        <h1 className="text-4xl font-extrabold mb-4">FLIP</h1>
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-300 flex items-center justify-center text-2xl font-bold">
          🪙
        </div>
        <div className="flex justify-center gap-4 mb-4">
          {FLIP_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setChoice(option)}
              className={`px-6 py-2 rounded-lg font-semibold ${
                choice === option ? "bg-green-500 text-black" : "bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2 mb-4">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className={`px-3 py-1 rounded-lg border ${
                amount === amt ? "bg-blue-500 text-white" : "bg-gray-100"
              }`}
            >
              {amt} SOL
            </button>
          ))}
        </div>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full mb-4 text-center"
          placeholder="Enter SOL amount"
        />
        <button
          onClick={handleBet}
          disabled={!wallet.publicKey}
          className="w-full py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300"
        >
          Bet
        </button>
      </div>
    </div>
  );
};

export default FlipCoin;
