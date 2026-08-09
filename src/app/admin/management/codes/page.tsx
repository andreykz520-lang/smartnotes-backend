export const dynamic = 'force-dynamic';
import { db } from '@/db';
import { activationCodes } from '@/db/schema';
import { eq, desc, ilike, and, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- SERVER ACTION: Сброс кода ---
async function resetCode(codeId: number) {
  'use server';
  await db
    .update(activationCodes)
    .set({ isUsed: false, deviceId: null, activatedAt: null })
    .where(eq(activationCodes.id, codeId));

  revalidatePath('/admin/management/codes');
}

// --- SERVER ACTION: Удалить код ---
async function deleteCode(codeId: number) {
  'use server';
  await db.delete(activationCodes).where(eq(activationCodes.id, codeId));
  revalidatePath('/admin/management/codes');
}

export default async function AdminCodesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const query = searchParams.q || '';
  const statusFilter = searchParams.status;

  // Drizzle запрос: Получаем все коды с фильтрацией
  const whereConditions = [];

  if (query) {
    whereConditions.push(ilike(activationCodes.code, `%${query.toUpperCase()}%`));
  }

  if (statusFilter === 'used') {
    whereConditions.push(eq(activationCodes.isUsed, true));
  } else if (statusFilter === 'unused') {
    whereConditions.push(eq(activationCodes.isUsed, false));
  }

  const codesList = await db.query.activationCodes.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    orderBy: (code) => [desc(code.createdAt)],
    limit: 200,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎟️ Управление кодами активации</h1>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ← Назад к статистике
          </a>
        </div>
      </div>

      {/* ФОРМА ПОИСКА И ФИЛЬТРАЦИЯ */}
      <form className="flex gap-2 flex-wrap" method="get">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Поиск по коду..."
          className="border p-2 rounded-lg w-full max-w-md"
        />
        <select name="status" defaultValue={statusFilter || ''} className="border p-2 rounded-lg">
          <option value="">Все коды</option>
          <option value="used">Только использованные</option>
          <option value="unused">Только свободные</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Найти
        </button>
      </form>

      {/* СТАТИСТИКА */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-slate-600">Всего свободных кодов</p>
          <p className="text-3xl font-bold text-green-600">
            {codesList.filter((c) => !c.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-slate-600">Всего использованных</p>
          <p className="text-3xl font-bold text-blue-600">
            {codesList.filter((c) => c.isUsed).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-slate-500">
          <p className="text-sm text-slate-600">Всего кодов</p>
          <p className="text-3xl font-bold text-slate-600">{codesList.length}</p>
        </div>
      </div>

      {/* ТАБЛИЦА */}
      <div className="bg-white rounded-xl shadow overflow-hidden border">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Код</th>
              <th className="p-4 font-semibold text-slate-600">Статус</th>
              <th className="p-4 font-semibold text-slate-600">Email пользователя</th>
              <th className="p-4 font-semibold text-slate-600">Device ID</th>
              <th className="p-4 font-semibold text-slate-600">Активирован</th>
              <th className="p-4 font-semibold text-slate-600">Создан</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {codesList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Коды не найдены
                </td>
              </tr>
            ) : (
              codesList.map((code) => (
                <tr key={code.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono bg-slate-100 px-3 py-1 rounded text-sm font-semibold text-slate-800">
                      {code.code}
                    </span>
                  </td>
                  <td className="p-4">
                    {code.isUsed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        ✅ Использован
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        🆓 Свободный
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-slate-600">
                      {code.email || <span className="text-slate-400 italic">-</span>}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-mono text-xs text-slate-500">
                      {code.deviceId
                        ? code.deviceId.substring(0, 12) + '...'
                        : '-'}
                    </p>
                  </td>
                  <td className="p-4">
                    {code.activatedAt ? (
                      <p className="text-sm text-slate-600">
                        {new Date(code.activatedAt).toLocaleString('ru-RU')}
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">-</p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600">
                      {new Date(code.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </td>
                  <td className="p-4 text-right space-x-2 flex justify-end">
                    {code.isUsed && (
                      <form action={resetCode.bind(null, code.id)}>
                        <button
                          type="submit"
                          className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-2 py-1 rounded transition-colors border border-yellow-200"
                          title="Сбросить код"
                        >
                          🔄 Сбросить
                        </button>
                      </form>
                    )}
                    <form action={deleteCode.bind(null, code.id)}>
                      <button
                        type="submit"
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded transition-colors border border-red-200"
                        title="Удалить код"
                      >
                        🗑️ Удалить
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
