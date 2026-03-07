import type { Metadata } from "next";
import {SettingsClient}  from "./_SettingsClient";

export const metadata: Metadata = {
  title: "Settings – Pervasively",
};

export default function EditProductPage() {
  return <SettingsClient />;
}