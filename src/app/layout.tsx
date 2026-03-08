import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pervasively – Content egine for solpreneurs",
  description: "Content engine for solopreneurs",
  icons: {icon: [{ url: '/pervasively.jpg', type: 'image/png', sizes: '32x32' }]},
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}