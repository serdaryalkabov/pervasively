import type { Metadata } from "next";
import GenerateClient  from "./_GenerateClient";

export const metadata: Metadata = {
  title: "Generate content – Pervasively",
};

export default function GeneratePage() {
  return <GenerateClient />;
}