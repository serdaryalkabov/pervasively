import type { Metadata } from "next";
import OnboardingClient  from "./_OnboardingClient";

export const metadata: Metadata = {
  title: "Create new product – Pervasively",
};

export default function EditProductPage() {
  return <OnboardingClient />;
}