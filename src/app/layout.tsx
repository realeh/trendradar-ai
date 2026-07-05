import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendRadar AI",
  description: "AI product research for ecommerce and dropshipping teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
