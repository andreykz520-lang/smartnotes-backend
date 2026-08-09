'use server';

import { db } from '@/db';
import { activationCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function resetCodeDevice(id: number) {
  await db.update(activationCodes)
    .set({ isUsed: false, deviceId: null, activatedAt: null })
    .where(eq(activationCodes.id, id));
  
  revalidatePath('/admin');
}

export async function generateCodeManually() {
  try {
    // Generate a secure, readable random code in format XXXX-XXXX-XXXX-XXXX
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

    const [newCode] = await db.insert(activationCodes).values({
      code: `PRO-${formattedCode}`,
    }).returning();

    revalidatePath('/admin');
    return { success: true, code: newCode.code };
  } catch (error) {
    console.error('Manual code generation error:', error);
    return { success: false, error: 'Failed to generate code' };
  }
}

export async function generateAiCodeManually() {
  try {
    // Generate a secure, readable random code for AI VIP
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;

    const [newCode] = await db.insert(activationCodes).values({
      code: `AI-${formattedCode}`,
    }).returning();

    revalidatePath('/admin');
    return { success: true, code: newCode.code };
  } catch (error) {
    console.error('Manual code generation error:', error);
    return { success: false, error: 'Failed to generate code' };
  }
}
