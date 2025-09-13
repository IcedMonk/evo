import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evolution API SAAS - WhatsApp API Management",
  description: "Professional WhatsApp API management platform with Evolution API",
  keywords: ["WhatsApp API", "Evolution API", "Messaging", "SAAS", "Bot Management"],
  authors: [{ name: "Evolution API SAAS Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}