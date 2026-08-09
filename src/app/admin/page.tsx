export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminStats } from '@/lib/stats';

export default async function AdminPage() {
  // Получаем данные на сервере (быстро и безопасно)
  const stats = await getAdminStats();

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <span>📊</span> {stats.currentPro} PRO-пользователей онлайн
        </h1>
        <Link 
          href="/admin/management"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors font-medium"
        >
          🔐 Управление
        </Link>
      </div>

      {/* Блок статистики (Грид из 4 карточек) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-2">👑 PRO-пользователей сейчас</p>
          <p className="text-4xl font-bold text-blue-600">{stats.currentPro}</p>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-2">📈 Всего активаций за всё время</p>
          <p className="text-4xl font-bold text-green-600">{stats.totalActivations}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-2">📉 Закончился PRO / Отключены</p>
          <p className="text-4xl font-bold text-red-600">{stats.expiredPro}</p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <p className="text-slate-500 text-sm font-medium mb-2">🎟 Ждут активации (коды)</p>
          <p className="text-4xl font-bold text-orange-600">{stats.pendingCodes}</p>
        </div>
      </div>

      {/* Блок кнопок-действий */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6 text-slate-800">⚡ Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/management/codes"
            className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-medium">Управление кодами</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            href="/admin/management/users"
            className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="font-medium">Пользователи</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            href="/admin/management/activate"
            className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg group-hover:bg-purple-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">Выдать PRO</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link 
            href="/admin/management/archive"
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 rounded-lg group-hover:bg-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="font-medium">Архив</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">ℹ️ Как читаются эти данные?</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
          <li><strong>PRO-пользователей сейчас:</strong> Люди, у которых сейчас активен PRO-статус</li>
          <li><strong>Всего активаций:</strong> Все пользователи, которые когда-либо получали PRO</li>
          <li><strong>Закончился PRO:</strong> Был PRO, но сейчас истёк (разница между предыдущим и текущим)</li>
          <li><strong>Ждут активации:</strong> Свободные коды, которые ещё никто не использовал</li>
        </ul>
      </div>
    </main>
  );
}
