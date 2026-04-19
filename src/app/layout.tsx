import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pervasively – The only marketing assistant that sounds human",
  description: "Pervasively turns your product knowledge into a full week of platform-ready content — Twitter/X, Instagram, LinkedIn — in under 10 minutes. No prompting. No guessing. Just post.",
  icons: { icon: [{ url: '/pervasively.jpg', type: 'image/png', sizes: '32x32' }] },
  openGraph: {
    title: "Pervasively – The only marketing assistant that sounds human",
    description: "The only marketing assistant that sounds human.",
    url: "https://pervasively.org",
    siteName: "Pervasively",
    images: [
      {
        url: "https://pervasively.org/og-pervasively.png",
        width: 1200,
        height: 630,
        alt: "Pervasively – The only marketing assistant that sounds human",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pervasively – The only marketing assistant that sounds human",
    description: "Generate 7 days of platform-native social posts from your product brief. No prompting. Just post.",
    images: ["https://pervasively.org/og-pervasively.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}