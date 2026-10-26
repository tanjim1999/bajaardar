import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "BajaarDar (বাজার দর) — Bangladesh Daily Commodity & Kitchen Market Tracker",
  description:
    "Real-time daily grocery, vegetable, and commodity price index for Bangladesh. Compare retail vs Karwan Bazar & Khatunganj wholesale rates, calculate your kitchen budget, and track price changes.",
  keywords: [
    "Bangladesh commodity prices",
    "Dhaka kitchen market",
    "Karwan Bazar wholesale price",
    "Bajar Dor",
    "বাজার দর",
    "আলুর দাম",
    "পেঁয়াজের দাম",
    "চাল ও তেলের দাম",
  ],
  authors: [{ name: "BajaarDar Bangladesh" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
