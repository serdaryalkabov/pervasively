import type { Metadata } from "next";
import {SignUpClient} from "./_SignUpClient";

export const metadata: Metadata = {
  title: "Sign up – Pervasively",
};

export default function DashboardPage() {
  return <SignUpClient />;
}