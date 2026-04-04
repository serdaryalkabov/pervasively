import type { Metadata } from "next";
import { TermsClient } from "./_TermsClient";

export const metadata: Metadata = {
  title: "Terms & Conditions – Pervasively",
};

export default function TermsPage() {
  return <TermsClient />;
}