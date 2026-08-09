import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, ilike } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- SERVER ACTION: Выдать PRO пользователю ---
async function grantProAction(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const daysStr = formData.get('days') as string;
  const days = parseInt(daysStr, 10);

  if (!email || days <= 0 || isNaN(days)) {
    throw new Error('Email и количество дней обязательны');
  }

  try {
    const user = await db.query.users.findFirst({
      where: (u) => ilike(u.email, email),
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const now = new Date();
    const proEndedAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        isPro: true,
        proStartedAt: now,
        proEndedAt,
        hadProBefore: true,
      })
      .where(eq(users.id, user.id));

    revalidatePath('/admin/management/activate');
  } catch (error) {
    console.error('Error granting PRO:', error);
    throw error;
  }
}

export default function AdminActivatePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">👑 Выдать PRO пользователю</h1>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            ← Назад к статистике
          </a>
        </div>
      </div>

      {/* ФОРМА */}
      <div className="bg-white rounded-xl shadow p-6">
        <form action={grantProAction} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email пользователя *
            </label>
            <input
              type="email"
              name="email"
              placeholder="user@example.com"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Количество дней *
            </label>
            <input
              type="number"
              name="days"
              min="1"
              max="365"
              defaultValue="30"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Внимание:</strong> При выдаче PRO будет установлена дата начала как текущая дата и время,
              а дата окончания будет рассчитана исходя из количества дней.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            ✅ Выдать PRO
          </button>
        </form>
      </div>

      {/* СПРАВКА */}
      <div className="bg-slate-50 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">ℹ️ Информация</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Введите email пользователя в точности так, как он зарегистрирован</li>
          <li>• Укажите количество дней, на которое нужно выдать PRO</li>
          <li>• Система автоматически рассчитает дату окончания PRO</li>
          <li>• После выдачи PRO пользователь сможет использовать полный функционал</li>
        </ul>
      </div>
    </div>
  );
}
