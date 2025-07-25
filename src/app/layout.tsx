import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/FE/common/BottomNavbar";
import UserDataProvider from "@/FE/context/user-provider";
import { Exo_2, Poppins } from "next/font/google";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Debonk Telegram Bot",
  description: "A Telegram bot for crypto trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className={`${exo2.variable} ${poppins.variable} antialiased h-screen overflow-y-auto bg-[#0B0B0B]`}
      >
        <UserDataProvider>
          <main className="pb-12 min-h-full">{children}</main>
          <BottomNav />
        </UserDataProvider>
      </body>
    </html>
  );
}
