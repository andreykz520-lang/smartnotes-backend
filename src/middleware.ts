import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MARKDOWN_CONTENT = `# SmartNotes AI

> SmartNotes AI is a cross-platform note-taking app with AI assistance, voice transcription, photo analysis, and end-to-end privacy.
> SmartNotes AI — мобильное и десктопное приложение для организации заметок, распознавания текста и анализа изображений с помощью искусственного интеллекта.

## Features / Возможности
- Smart notes with categories, tags, and instant search (Умные заметки с категориями и тегами).
- Real-time voice-to-text dictation (Голосовой ввод на лету).
- AI Assistant chat with photo and document analysis powered by Gemini Flash (ИИ-ассистент с анализом фото).
- Secure private notes with PIN code and encryption (Приватные заметки под защитой PIN).
- Cloud synchronization across devices (Синхронизация между устройствами).

## Download & Official Links / Ссылки
- Official Website: https://smartnotes-ai.ru/
- RuStore Catalog: https://www.rustore.ru/catalog/app/com.andrey.smartnotes
- Android APK: https://smartnotes-ai.ru/SmartNotes.apk
- Windows Installer: https://smartnotes-ai.ru/SmartNotes-Setup.exe
- Linux (.AppImage): https://smartnotes-ai.ru/SmartNotes-Linux.AppImage
- Linux (.deb): https://smartnotes-ai.ru/SmartNotes-Linux.deb
- Privacy Policy: https://smartnotes-ai.ru/privacy
- Terms of Service: https://smartnotes-ai.ru/terms
- Refund Policy: https://smartnotes-ai.ru/refund
`;

export function middleware(request: NextRequest) {
  const accept = request.headers.get('accept') || '';
  const pathname = request.nextUrl.pathname;

  // Markdown content negotiation for AI agents
  if (accept.includes('text/markdown') && (pathname === '/' || pathname === '')) {
    return new NextResponse(MARKDOWN_CONTENT, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': '260',
        'Vary': 'Accept',
        'Link': '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"',
      },
    });
  }

  const response = NextResponse.next();

  // Add Link headers for agent discovery on homepage
  if (pathname === '/' || pathname === '') {
    response.headers.set(
      'Link',
      '</llms.txt>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"'
    );
  }

  return response;
}

export const config = {
  matcher: ['/'],
};
