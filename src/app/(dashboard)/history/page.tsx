import type { Metadata } from "next";
import {HistoryClient}  from "./_HistoryClient";

export const metadata: Metadata = {
  title: "History – Pervasively",
};

export default function EditProductPage() {
  return <HistoryClient />;
}