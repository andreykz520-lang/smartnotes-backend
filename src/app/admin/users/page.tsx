export const dynamic = 'force-dynamic';

import { db } from '@/db';
import { users, activationCodes } from '@/db/schema';
import { eq, ilike, or, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- SERVER ACTION: Кнопка Выдать/Забрать PRO ---
async function toggleProStatus(userId: number, currentStatus: boolean) {
  'use server';
  await db
    .update(users)
    .set({
      isPro: !currentStatus,
      hadProBefore: !currentStatus ? true : undefined,
    })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
}

// --- SERVER ACTION: Сброс блокировки ---
async function resetLock(userId: number) {
  'use server';
  await db
    .update(users)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));

  revalidatePath('/admin/users');
}

// --- SERVER ACTION: Сброс кода ---
async function resetCode(codeId: number) {
  'use server';
  await db
    .update(activationCodes)
    .set({ isUsed: false, deviceId: null, activatedAt: null })
    .where(eq(activationCodes.id, codeId));

  revalidatePath('/admin/users');
}

// ------------------------------------------------
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const query = searchParams.q || '';
  const statusFilter = searchParams.status;

  // Drizzle запрос: Ищем юзеров и подтягиваем историю их кодов
  const whereConditions = [];
  if (query) {
    whereConditions.push(
      or(
        ilike(users.email, `%${query}%`), // Поиск по email (Neon.tech PostgreSQL)
        ilike(users.deviceId, `%${query}%`) // Поиск по deviceId
      )
    );
  }

  if (statusFilter === 'pro') {
    whereConditions.push(eq(users.isPro, true));
  } else if (statusFilter === 'free') {
    whereConditions.push(eq(users.isPro, false));
  }

  const usersList = await db.query.users.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      usedCodes: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)], // Новые пользователи сверху
    limit: 100,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">👥 Пользователи</h1>
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
          placeholder="Поиск по Email или Device ID..."
          className="border p-2 rounded-lg w-full max-w-md"
        />
        <select name="status" defaultValue={statusFilter || ''} className="border p-2 rounded-lg">
          <option value="">Все статусы</option>
          <option value="pro">Только PRO</option>
          <option value="free">Только Free</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Найти
        </button>
      </form>

      {/* ТАБЛИЦА */}
      <div className="bg-white rounded-xl shadow overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Пользователь
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Статус PRO
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                Попытки
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600">
                История кодов
              </th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {usersList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              usersList.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-slate-50 transition-colors"
                >
                  {/* 1. Инфо о пользователе */}
                  <td className="p-4">
                    <p className="font-medium text-slate-800">
                      {user.email || 'Без email'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      ID: {user.id}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Device: {user.deviceId?.substring(0, 8) || '-'}...
                    </p>
                    {user.lockedUntil && user.lockedUntil > new Date() && (
                      <p className="text-xs text-red-500 mt-1">
                        🔒 Блок до{' '}
                        {user.lockedUntil.toLocaleTimeString('ru-RU')}
                      </p>
                    )}
                  </td>

                  {/* 2. Статус PRO */}
                  <td className="p-4">
                    {user.isPro ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        ✅ PRO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                        ⚪ Free
                      </span>
                    )}
                    {user.hadProBefore && (
                      <p className="text-xs text-slate-400 mt-1">
                        ✨ Был PRO раннее
                      </p>
                    )}
                  </td>

                  {/* 3. Попытки */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {user.failedAttempts || 0}/5
                      </span>
                      <form action={async () => resetLock(user.id)}>
                        <button
                          type="submit"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          title="Сбросить блокировку"
                        >
                          🔄
                        </button>
                      </form>
                    </div>
                    {user.failedAttempts && user.failedAttempts >= 5 && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Заблокирован
                      </p>
                    )}
                  </td>

                  {/* 4. История вводов кодов */}
                  <td className="p-4 text-sm">
                    <div className="space-y-2">
                      {user.proStartedAt && (
                        <div className="p-2 bg-green-50 rounded-lg text-xs">
                          <p className="text-green-700 font-medium">
                            PRO активен с{' '}
                            {new Date(user.proStartedAt).toLocaleDateString(
                              'ru-RU'
                            )}
                          </p>
                          {user.proEndedAt && (
                            <p className="text-green-600">
                              До: {new Date(user.proEndedAt).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                      )}

                      <details className="group">
                        <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 list-none flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 transition-transform group-open:rotate-90"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          История активаций (
                          {user.usedCodes?.length || 0})
                        </summary>
                        <div className="mt-2 space-y-2 pl-2">
                          {user.usedCodes && user.usedCodes.length > 0 ? (
                            user.usedCodes.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                              >
                                <div className="flex flex-col">
                                  <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-sm text-slate-800">
                                    {c.code}
                                  </span>
                                  <span className="text-xs text-slate-400 mt-0.5">
                                    {c.activatedAt
                                      ? new Date(c.activatedAt).toLocaleString(
                                          'ru-RU'
                                        )
                                      : 'Не активирован'}
                                  </span>
                                </div>
                                {c.isUsed && (
                                  <form action={async () => resetCode(c.id)}>
                                    <button
                                      type="submit"
                                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                      title="Сбросить код"
                                    >
                                      🔄
                                    </button>
                                  </form>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 italic pl-6">
                              Нет активаций
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  </td>

                  {/* 5. Кнопки (Server Action Form) */}
                  <td className="p-4 text-right">
                    <form action={async () => toggleProStatus(user.id, user.isPro)}>
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          user.isPro
                            ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {user.isPro ? 'Забрать PRO' : 'Выдать PRO'}
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
