import { db } from '@/db';
import { users } from '@/db/schema';
import { lt, desc } from 'drizzle-orm';

export default async function AdminArchivePage() {
  // Получаем пользователей с истекшим PRO
  const expiredUsers = await db.query.users.findMany({
    where: (user) => lt(user.proEndedAt, new Date()),
    orderBy: (user) => [desc(user.proEndedAt)],
    limit: 100,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📚 Архив (истекший PRO)</h1>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ← Назад к статистике
          </a>
        </div>
      </div>

      {/* СТАТИСТИКА */}
      <div className="bg-white p-6 rounded-xl shadow border-l-4 border-slate-500">
        <p className="text-sm text-slate-600">Пользователей с истекшим PRO</p>
        <p className="text-4xl font-bold text-slate-700 mt-2">{expiredUsers.length}</p>
      </div>

      {/* ТАБЛИЦА */}
      <div className="bg-white rounded-xl shadow overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">Email</th>
              <th className="p-4 text-sm font-semibold text-slate-600">PRO начался</th>
              <th className="p-4 text-sm font-semibold text-slate-600">PRO закончился</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Дней использовал</th>
            </tr>
          </thead>
          <tbody>
            {expiredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  Нет пользователей с истекшим PRO
                </td>
              </tr>
            ) : (
              expiredUsers.map((user) => {
                const daysUsed = user.proStartedAt && user.proEndedAt
                  ? Math.floor((new Date(user.proEndedAt).getTime() - new Date(user.proStartedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{user.email || 'Без email'}</p>
                      <p className="text-xs text-slate-400 mt-1">ID: {user.id}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {user.proStartedAt
                        ? new Date(user.proStartedAt).toLocaleDateString('ru-RU')
                        : '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {user.proEndedAt
                        ? new Date(user.proEndedAt).toLocaleDateString('ru-RU')
                        : '-'}
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700">
                      {daysUsed} дней
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
