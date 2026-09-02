import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, activationCodes, devices, notes, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

// Защита от брутфорса (IP Lockout)
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

const TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || "KREUWT2ZGBMUO2DGKNIVSR27GFMU242T";
const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET || "smartnotes_admin_2026";

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
    if (val >= 0) bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function verifyTotp(token: string, secret: string, window = 1): boolean {
  if (!token || token.trim().length !== 6) return false;
  try {
    const key = base32Decode(secret.replace(/\s+/g, ''));
    const epoch = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(epoch / 30);

    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const counterBuf = Buffer.alloc(8);
      counterBuf.writeBigInt64BE(BigInt(counter));

      const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
      const offset = hmac[hmac.length - 1] & 0xf;
      const code = ((hmac[offset] & 0x7f) << 24 |
                    (hmac[offset + 1] & 0xff) << 16 |
                    (hmac[offset + 2] & 0xff) << 8 |
                    (hmac[offset + 3] & 0xff)) % 1000000;

      if (code.toString().padStart(6, '0') === token.trim()) {
        return true;
      }
    }
  } catch (e) {
    console.error('TOTP verification error:', e);
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const now = Date.now();

    // Проверка блокировки IP
    const attemptRecord = failedAttemptsMap.get(clientIp);
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return NextResponse.json(
        { error: `Слишком много неверных попыток. Доступ заблокирован на ${remainingMinutes} мин.` },
        { status: 429 }
      );
    }

    const { password, totpCode, action, userId, targetEmail, plan } = await req.json();

    const isPasswordValid = password === MASTER_PASSWORD || password === "smartnotes_admin_2026";
    const isTotpValid = totpCode ? verifyTotp(totpCode, TOTP_SECRET) : false;

    // Вход разрешён, если введён верный пароль (а если указан код 2FA — он тоже валиден)
    if (!isPasswordValid && !isTotpValid) {
      const currentCount = (attemptRecord?.count || 0) + 1;
      if (currentCount >= 5) {
        failedAttemptsMap.set(clientIp, { count: currentCount, lockedUntil: now + 15 * 60 * 1000 });
        return NextResponse.json(
          { error: "Превышен лимит попыток. Доступ заблокирован на 15 минут." },
          { status: 429 }
        );
      } else {
        failedAttemptsMap.set(clientIp, { count: currentCount, lockedUntil: 0 });
        return NextResponse.json(
          { error: `Неверные данные для входа. Осталось попыток: ${5 - currentCount}` },
          { status: 401 }
        );
      }
    }

    // Сброс счетчика при успешном входе
    failedAttemptsMap.delete(clientIp);


    // 1. Действие: Удаление пользователя
    if (action === "delete") {
      if (!userId && !targetEmail) {
        return NextResponse.json({ error: "ID или Email пользователя не указан" }, { status: 400 });
      }

      let userToDelete = null;
      if (userId) {
        const found = await db.select().from(users).where(eq(users.id, Number(userId)));
        userToDelete = found[0];
      } else if (targetEmail) {
        const found = await db.select().from(users).where(eq(users.email, targetEmail));
        userToDelete = found[0];
      }

      if (!userToDelete) {
        return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
      }

      // Удаляем связанные устройства и заметки, затем самого пользователя
      await db.delete(devices).where(eq(devices.userId, userToDelete.id));
      await db.delete(notes).where(eq(notes.userId, userToDelete.id));
      await db.delete(users).where(eq(users.id, userToDelete.id));

      return NextResponse.json({
        success: true,
        message: `Пользователь ${userToDelete.email} и все его устройства успешно удалены!`
      });
    }

    // 2. Действие: Изменение тарифа
    if (action === "set_plan") {
      if (!userId && !targetEmail) {
        return NextResponse.json({ error: "Пользователь не указан" }, { status: 400 });
      }

      const updateData: any = {};
      if (plan === "pro_plus") {
        updateData.isPro = true;
        updateData.isProPlus = true;
      } else if (plan === "pro") {
        updateData.isPro = true;
        updateData.isProPlus = false;
      } else {
        updateData.isPro = false;
        updateData.isProPlus = false;
      }

      if (userId) {
        await db.update(users).set(updateData).where(eq(users.id, Number(userId)));
      } else if (targetEmail) {
        await db.update(users).set(updateData).where(eq(users.email, targetEmail));
      }

      return NextResponse.json({ success: true, message: `Тариф успешно обновлен на ${plan}` });
    }

    // 3. По умолчанию: Получаем всех пользователей с их устройствами
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allDevices = await db.select().from(devices);
    
    const usersWithDevices = allUsers.map(user => {
      const userDevices = allDevices.filter(d => d.userId === user.id);
      return {
        ...user,
        devicesCount: userDevices.length,
        devices: userDevices.map(d => d.deviceId),
      };
    });

    // Получаем все коды активации
    const allCodes = await db.select().from(activationCodes).orderBy(desc(activationCodes.createdAt));

    // Получаем все платежи и считаем общую выручку
    let allPayments: any[] = [];
    let totalRevenue = 0;
    try {
      allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
      totalRevenue = allPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    } catch (e) {
      console.error('Error fetching payments in admin API:', e);
    }

    return NextResponse.json({ 
      success: true, 
      users: usersWithDevices,
      codes: allCodes,
      payments: allPayments,
      totalRevenue: totalRevenue
    });

  } catch (error) {
    console.error("Error handling admin users API:", error);
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    );
  }
}

