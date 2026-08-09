import Link from 'next/link';

export default function AdminManagementPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🔐 Управление админкой</h1>
        <Link
          href="/admin"
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          ← Назад к статистике
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/management/codes"
          className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">🎟️ Управление кодами</h2>
          <p className="mt-2 text-sm text-slate-600">
            Просмотр, поиск и управление кодами активации.
          </p>
        </Link>

        <Link
          href="/admin/management/users"
          className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">👥 Пользователи</h2>
          <p className="mt-2 text-sm text-slate-600">
            Управление пользователями, PRO-статусом и блокировками.
          </p>
        </Link>

        <Link
          href="/admin/management/activate"
          className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">👑 Выдать PRO</h2>
          <p className="mt-2 text-sm text-slate-600">
            Выдача PRO пользователю вручную на выбранное количество дней.
          </p>
        </Link>

        <Link
          href="/admin/management/archive"
          className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">📚 Архив</h2>
          <p className="mt-2 text-sm text-slate-600">
            Список пользователей с истекшим PRO.
          </p>
        </Link>
      </div>
    </div>
  );
}
