'use server';

import { db } from '@/db';
import { users, activationCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function activatePromoCode(deviceId: string, codeStr: string) {
  try {
    // 1. Ищем пользователя по deviceId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.deviceId, deviceId));

    if (!user) {
      // Если пользователя нет, создаём нового
      const [newUser] = await db
        .insert(users)
        .values({ deviceId, email: null })
        .returning();
      
      return await activateCodeForUser(newUser.id, deviceId, codeStr);
    }

    // 2. ПРОВЕРКА БЛОКИРОВКИ
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      );
      return {
        error: `Слишком много попыток. Ждите ${minutesLeft} мин.`,
      };
    }

    // 3. Ищем код в базе
    const [codeRecord] = await db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.code, codeStr));

    // 4. ЕСЛИ КОД НЕВЕРНЫЙ ИЛИ ИСПОЛЬЗОВАН
    if (!codeRecord || codeRecord.isUsed) {
      const newAttempts = (user.failedAttempts || 0) + 1;

      // Блокируем на 1 час при 5 ошибках
      if (newAttempts >= 5) {
        const lockTime = new Date(Date.now() + 60 * 60 * 1000);
        await db
          .update(users)
          .set({
            failedAttempts: 0,
            lockedUntil: lockTime,
          })
          .where(eq(users.deviceId, deviceId));

        return {
          error:
            'Ввод заблокирован на 1 час из-за подозрительной активности.',
        };
      }

      // Иначе просто записываем ошибку
      await db
        .update(users)
        .set({ failedAttempts: newAttempts })
        .where(eq(users.deviceId, deviceId));

      return {
        error: `Неверный код. Осталось попыток: ${5 - newAttempts}`,
      };
    }

    // 5. УСПЕХ (Транзакция: одновременно даем ПРО и сжигаем код)
    await db.transaction(async (tx) => {
      // Обновляем юзера (сбрасываем счетчик ошибок)
      await tx
        .update(users)
        .set({
          isPro: true,
          hadProBefore: true,
          failedAttempts: 0,
          lockedUntil: null,
          proStartedAt: new Date(),
          proEndedAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
        })
        .where(eq(users.deviceId, deviceId));

      // Обновляем код
      await tx
        .update(activationCodes)
        .set({
          isUsed: true,
          deviceId: deviceId,
          activatedAt: new Date(),
        })
        .where(eq(activationCodes.id, codeRecord.id));
    });

    return {
      success: true,
      message: 'PRO успешно активирован!',
    };
  } catch (error) {
    console.error('Error activating code:', error);
    return { error: 'Ошибка при активации кода' };
  }
}

async function activateCodeForUser(
  userId: number,
  deviceId: string,
  codeStr: string
) {
  try {
    // 3. Ищем код в базе
    const [codeRecord] = await db
      .select()
      .from(activationCodes)
      .where(eq(activationCodes.code, codeStr));

    // 4. ЕСЛИ КОД НЕВЕРНЫЙ ИЛИ ИСПОЛЬЗОВАН
    if (!codeRecord || codeRecord.isUsed) {
      return { error: 'Неверный код' };
    }

    // 5. УСПЕХ (Транзакция: одновременно даем ПРО и сжигаем код)
    await db.transaction(async (tx) => {
      // Обновляем юзера
      await tx
        .update(users)
        .set({
          isPro: true,
          hadProBefore: true,
          failedAttempts: 0,
          lockedUntil: null,
          proStartedAt: new Date(),
          proEndedAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 год
        })
        .where(eq(users.id, userId));

      // Обновляем код
      await tx
        .update(activationCodes)
        .set({
          isUsed: true,
          deviceId: deviceId,
          activatedAt: new Date(),
        })
        .where(eq(activationCodes.id, codeRecord.id));
    });

    return {
      success: true,
      message: 'PRO успешно активирован!',
    };
  } catch (error) {
    console.error('Error activating code for new user:', error);
    return { error: 'Ошибка при активации кода' };
  }
}
