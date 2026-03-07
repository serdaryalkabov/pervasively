import type { Metadata } from "next";
import { EditProductClient } from "./_EditProduct";

export const metadata: Metadata = {
  title: "Edit Product – Pervasively",
};

export default function EditProductPage() {
  return <EditProductClient />;
}