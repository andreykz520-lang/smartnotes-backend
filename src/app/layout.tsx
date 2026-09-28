import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes AI — Умные голосовые заметки с нейросетью | Транскрибация аудио в текст и ИИ-помощник",
  description: "SmartNotes AI превращает ваши голосовые сообщения, аудиозаписи и мысли в структурированные заметки, конспекты и списки задач с помощью нейросетей. Скачайте приложение для Android, Windows и Linux бесплатно!",
  keywords: [
    "smartnotes ai",
    "смартнотес",
    "умные заметки нейросеть",
    "голосовые заметки в текст",
    "транскрибация аудио в текст",
    "заметки с искусственным интеллектом",
    "ии помощник для заметок",
    "расшифровка аудиозаписей",
    "конспекты с помощью нейросети",
    "приложение для заметок на русском",
    "умный диктофон с расшифровкой"
  ],
  alternates: {
    canonical: "https://smartnotes-ai.ru"
  },
  openGraph: {
    title: "SmartNotes AI — Умные голосовые заметки с нейросетью",
    description: "Мгновенное превращение голоса и аудиозаписей в структурированные заметки и резюме с помощью ИИ.",
    url: "https://smartnotes-ai.ru",
    siteName: "SmartNotes AI",
    images: [{ url: "https://smartnotes-ai.ru/app_logo.png", width: 1200, height: 630 }],
    locale: "ru_RU",
    type: "website"
  }
};

import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <head>
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
