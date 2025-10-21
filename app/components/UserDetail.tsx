"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useEffect, useState } from "react";

const UserDetail = ({
  balance,
  setBalance,
}: {
  balance: number | null;
  setBalance: (bal: number) => void;
}) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);

  async function handleAirdrop() {
    setLoading(true);
    if (wallet.publicKey) {
      const sig = await connection.requestAirdrop(
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL
      );
      const sign = await connection.confirmTransaction(sig, "confirmed");
      console.log(sign);
      await getUserBalance();
    }
    setLoading(false);
  }
  async function getUserBalance() {
    setLoading(true);
    const bal = await connection.getBalance(new PublicKey(wallet?.publicKey!));
    setBalance(bal / LAMPORTS_PER_SOL);
    setLoading(false);
  }

  useEffect(() => {
    getUserBalance();
  }, [wallet.publicKey]);

  return (
    <div className="flex items-center justify-end ">
      {wallet.publicKey && (
        <div className="flex items-center justify-end gap-4">
          <div className="text-sm">
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {wallet.publicKey.toBase58().slice(0, 6)}...
              {wallet.publicKey.toBase58().slice(-4)}
            </p>
            <p>
              <span className="font-semibold">
                Balance: {loading ? "..." : `${balance}`}{" "}
              </span>
              SOL
            </p>
          </div>
          <button
            onClick={handleAirdrop}
            className="px-3 py-1  text-white rounded-lg hover:bg-green-600 cursor-pointer items-end"
          >
            Airdrop
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
