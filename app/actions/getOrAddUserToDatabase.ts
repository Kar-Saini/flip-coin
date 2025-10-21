"use server";
import prisma from "../lib/prisma";

export async function getOrAddUserToDatabase(publicKey: string) {
  if (!publicKey) return;
  try {
    const user = await prisma.user.findUnique({ where: { publicKey } });
    if (!user) {
      await prisma.user.create({ data: { publicKey } });
      return user;
    }
    return user;
  } catch (error) {}
}
