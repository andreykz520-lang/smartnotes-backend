import { db } from '@/db';
import { users, activationCodes } from '@/db/schema';
import { count, eq } from 'drizzle-orm';

export async function getAdminStats() {
  try {
    // 1. Текущие PRO
    const currentProResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isPro, true));
    const currentPro = currentProResult[0]?.count || 0;

    // 2. Всего людей, которые когда-либо имели PRO
    const totalActivationsResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.hadProBefore, true));
    const totalActivations = totalActivationsResult[0]?.count || 0;

    // 3. Закончился PRO (был PRO, но сейчас не активен)
    const expiredPro = totalActivations - currentPro;

    // 4. Ждут активации (неиспользованные коды)
    const pendingCodesResult = await db
      .select({ count: count() })
      .from(activationCodes)
      .where(eq(activationCodes.isUsed, false));
    const pendingCodes = pendingCodesResult[0]?.count || 0;

    return {
      currentPro,
      totalActivations,
      expiredPro,
      pendingCodes,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      currentPro: 0,
      totalActivations: 0,
      expiredPro: 0,
      pendingCodes: 0,
    };
  }
}
