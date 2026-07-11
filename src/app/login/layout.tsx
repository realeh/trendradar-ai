import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In or Sign Up"
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
