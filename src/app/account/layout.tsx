import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account & Billing" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
