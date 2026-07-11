import type { Metadata } from "next";
import "./globals.css";

const description = "AI product research for ecommerce and dropshipping teams.";

export const metadata: Metadata = {
  title: {
    default: "TrendRadar AI",
    template: "%s | TrendRadar AI"
  },
  description,
  openGraph: {
    title: "TrendRadar AI",
    description,
    siteName: "TrendRadar AI",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "TrendRadar AI",
    description
  }
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
