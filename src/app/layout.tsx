import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientAppWrapper } from "@/components/ClientAppWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "MotoPilot",
  description: "Painel de gestão para motoristas e entregadores.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MotoPilot",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#EA1D2C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClientAppWrapper>
          {children}
        </ClientAppWrapper>
      </body>
    </html>
  );
}
