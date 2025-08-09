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
  title: "CakeMe App",
  description: "Track and celebrate the people you care about",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cabin.variable}`}>
      <body className="font-sans bg-[var(--background)] text-[var(--foreground)] min-h-dvh">
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar: hidden on mobile, visible on md+ */}
              <div className="hidden md:block">
                <Sidebar />
              </div>

              <main className="flex flex-1 flex-col">
                <div className="flex-1 p-4 md:p-6">
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
