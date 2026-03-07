import type { Metadata } from "next";
import FeedbackClient  from "./_FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback – Pervasively",
};

export default function EditProductPage() {
  return <FeedbackClient />;
}