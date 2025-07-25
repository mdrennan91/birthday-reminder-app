import type { Metadata } from "next";
import { Cabin } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/components/SidebarNav";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { Providers } from "./providers";
import MainContent from "@/app/components/MainContent";

// Cabin font setup
const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Birthday Reminder App",
  description: "Track and celebrate the people you care about",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cabin.variable}`}>
      <body className={`font-sans bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 flex flex-col">
                <div className="flex-1 p-6">
                  <MainContent />
                  {children}
                </div>
              </main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
