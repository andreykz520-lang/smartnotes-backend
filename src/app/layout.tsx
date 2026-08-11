import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes AI",
  description: "Официальный сайт приложения SmartNotes AI",
};

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-100 text-slate-900 antialiased">
        <LanguageProvider>
          <main className="flex-grow">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
