import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hidden Gems" };

export default function HiddenGemsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
