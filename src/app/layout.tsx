import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "@/contexts/theme-context";
import { BrandProvider } from "@/contexts/brand-context";
import { BrandHeadClient } from "@/components/brand-head-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zyra",
  description: "Generate instant invoices with QR codes for fast payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v1/inline.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <BrandProvider>
          <ThemeProvider>
            <ThirdwebProvider>
              <BrandHeadClient />
              {children}
            </ThirdwebProvider>
          </ThemeProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
