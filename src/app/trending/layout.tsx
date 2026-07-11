import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trending Products" };

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
