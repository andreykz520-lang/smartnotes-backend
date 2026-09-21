import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartNotes AI",
  description: "Официальный сайт приложения SmartNotes AI",
};

import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full">
      <head>
        <link rel="service-doc" href="/llms.txt" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
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
