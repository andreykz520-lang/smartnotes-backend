import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes AI — Умный блокнот и записная книжка с ИИ",
  description: "Умный блокнот и электронная записная книжка с ИИ на 6 языках. Голосовой ввод, расшифровка аудио в текст. Скачайте для Android, Windows или онлайн.",
  keywords: [
    "блокнот",
    "скачать блокнот",
    "умный блокнот",
    "электронная записная книжка",
    "записная книжка",
    "записная книжка на русском",
    "записная книжка на 6 языках",
    "блокнот для заметок",
    "онлайн блокнот для заметок",
    "голосовой блокнот",
    "блокнот с искусственным интеллектом",
    "умный диктофон с расшифровкой",
    "транскрибация аудио в текст",
    "smartnotes ai",
    "смартнотес",
    "умные заметки нейросеть",
    "smart notebook",
    "ai notepad",
    "bloc de notas con ia",
    "carnet de notes ia"
  ],
  alternates: {
    canonical: "https://smartnotes-ai.ru"
  },
  openGraph: {
    title: "SmartNotes AI — Умный блокнот и электронная записная книжка с ИИ (на 6 языках)",
    description: "Мгновенное превращение голоса и мыслей в структурированные заметки, конспекты и резюме с помощью ИИ. Доступно онлайн и для всех платформ.",
    url: "https://smartnotes-ai.ru",
    siteName: "SmartNotes AI",
    images: [{ url: "https://smartnotes-ai.ru/app_logo.png", width: 1200, height: 630 }],
    locale: "ru_RU",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/icon.png?v=2", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "48x48" }
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [
      { url: "/apple-icon.png?v=2", sizes: "180x180", type: "image/png" }
    ]
  },
  verification: {
    yandex: "38736647fe8c5b9c",
    google: "google466842291cd2c381"
  }
};

import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <meta name="yandex-verification" content="38736647fe8c5b9c" />
        <meta name="google-site-verification" content="google466842291cd2c381" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png?v=2" />
        <link rel="service-doc" href="/llms.txt" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "SmartNotes AI",
              "operatingSystem": "Android, Windows, Linux, Web",
              "applicationCategory": "ProductivityApplication",
              "description": "Умное приложение для ведения заметок, транскрибации голоса и структурирования мыслей с помощью нейросетей.",
              "url": "https://smartnotes-ai.ru",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "RUB"
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `

(function() {
  function initWebMCP() {
    try {
      if (typeof navigator !== 'undefined' && navigator.modelContext && typeof navigator.modelContext.provideContext === 'function') {
        navigator.modelContext.provideContext({
          tools: [
            {
              name: "createNote",
              description: "Create a new AI-enhanced voice note or summary",
              inputSchema: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Title of the note" },
                  content: { type: "string", description: "Content of the note" }
                },
                required: ["content"]
              },
              execute: async function(p) { return { success: true, result: "Note created: " + (p.title || "Untitled") }; }
            },
            {
              name: "searchNotes",
              description: "Search notes and audio transcripts by keyword or topic",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Search query" }
                },
                required: ["query"]
              },
              execute: async function(p) { return { success: true, result: "Search results for: " + p.query }; }
            }
          ]
        });
      }
    } catch(e) {
      console.warn("WebMCP init error", e);
    }
  }
  initWebMCP();
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initWebMCP);
  }
})();
`,
          }}
        />
      </head>
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
