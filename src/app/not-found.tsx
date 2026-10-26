import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Страница не найдена (404) — SmartNotes AI',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center px-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-3xl font-bold">
          404
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Страница не найдена</h1>
          <p className="text-sm text-gray-400">
            Запрошенная страница не существует или была перемещена. Вы можете вернуться на главную страницу SmartNotes AI.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all text-center"
          >
            ← На главную
          </Link>
          <Link
            href="/guide"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-all text-center"
          >
            Инструкция
          </Link>
        </div>
      </div>
    </div>
  );
}
