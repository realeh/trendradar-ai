import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Store Mode" };

export default function NewStoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
