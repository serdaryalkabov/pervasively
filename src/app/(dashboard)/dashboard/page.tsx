import type { Metadata } from "next";
import { DashboardClient } from "./_DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard – Pervasively",
};

export default function DashboardPage() {
  return <DashboardClient />;
}