import {
  Connection,
  PublicKey,
  ParsedTransactionWithMeta,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

import { NextResponse } from "next/server";
const connection = new Connection("http://127.0.0.1:8899");
const PLATFORM_PUB_KEY = new PublicKey(
  "DypfnKJyBN5TkGf4CWYTN4B2tU2tRPgSzfV1QYWdSJP7"
);

const secretKeyBytes: Uint8Array = bs58.decode(
  "2hLQTTZMHHT4Q2bd2vprtSA95kGAK5uwgGCaPmV5Yvf7i3yqyqHiJX6g3vkjt72naLndrkDtLYLCHUhuRBa39w97"
);

const PLATFORM_KEYPAIR = Keypair.fromSecretKey(secretKeyBytes);

export async function POST(req: Request) {
  try {
    const { signature } = await req.json();
    const tx = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
    });
    if (!tx) return;
    const memoMetaData = extractMemo(tx);
    if (!memoMetaData) {
      return NextResponse.json({ msg: "Error, No metadata found" });
    }
    console.log(memoMetaData);
    const outcome = Math.random() > 0.5 ? "Heads" : "Tails";
    if (outcome === memoMetaData.choice) {
      let wonAMount = parseFloat(memoMetaData.amount) * 2 * 0.95;
      let tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: PLATFORM_PUB_KEY,
          toPubkey: new PublicKey(memoMetaData.publicKey),
          lamports: wonAMount,
        })
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = PLATFORM_KEYPAIR.publicKey;
      console.log("transaction");
      console.log(tx);
      tx.sign(PLATFORM_KEYPAIR);
      const rawTx = tx.serialize();
      console.log("rawTx");
      console.log(rawTx);
      const sig = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction signature:", sig);

      const confirmation = await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      console.log("Transaction confirmed:", confirmation.value);
      return NextResponse.json({ msg: "You won" });
    } else {
      return NextResponse.json({ msg: "You lost" });
    }
  } catch (error: any) {
    console.error("Transaction error:", error);
    return NextResponse.json({ msg: "Error", error: error.message });
  }
}

function extractMemo(tx: ParsedTransactionWithMeta) {
  const logMessages = tx.meta?.logMessages ?? [];
  const memoLog = logMessages.find((msg) => msg.includes("Program log: Memo"));
  let memo = null;
  if (memoLog) {
    const match = memoLog.match(/"([^"]+)"/);
    memo = match ? match[1] : null;
  }
  if (!memo) return;
  const [userId, choice, amount, publicKey] = memo
    ?.split("|")
    .map((ele: string) => ele.trim());
  return { userId, choice, amount, publicKey };
}
