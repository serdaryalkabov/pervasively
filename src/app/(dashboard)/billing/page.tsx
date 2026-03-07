import type { Metadata } from "next";
import {BillingPage} from "./_BillingClient";

export const metadata: Metadata = {
  title: "Billing – Pervasively",
};

export default function DashboardPage() {
  return <BillingPage />;
}