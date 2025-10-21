"use server";
import prisma from "../lib/prisma";

export async function getUserTransactions(userId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { bets: true },
      orderBy: { createdAt: "desc" },
    });
    return transactions;
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
}
