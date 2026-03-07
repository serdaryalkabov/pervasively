import type { Metadata } from "next";
import SignInClient from "./_SignInClient";

export const metadata: Metadata = {
  title: "Sign in – Pervasively",
};

export default function DashboardPage() {
  return <SignInClient />;
}