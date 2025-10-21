import type { Metadata } from "next";
import { Anta, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const anta = Anta({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coin Flip",
  description: "Coin Flip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anta.className} bg-gradient-to-r from-purple-500 to-pink-400`}
      >
        {children}
      </body>
    </html>
  );
}
