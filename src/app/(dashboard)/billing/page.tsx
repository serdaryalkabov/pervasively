import type { Metadata } from "next";
import BillingClient from "./_BillingClient";
import BillingPage from "./_BillingClient";

export const metadata: Metadata = {
  title: "Billing – Pervasively",
};

export default function DashboardPage() {
  return <BillingPage />;
}