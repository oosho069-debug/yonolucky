import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import SplashScreen from "../components/SplashScreen";

export const metadata: Metadata = {
  title: "Yonolucky",
  description: "Play color prediction and lottery games",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yonolucky",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981", // Emerald 500 (Green)
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-100 min-h-screen">
        <SplashScreen />
        <main className="app-container shadow-2xl bg-white overflow-x-hidden pb-16 relative">
          {children}
        </main>
      </body>
    </html>
  );
}
