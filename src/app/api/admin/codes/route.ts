import { db } from '@/db';
import { activationCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Admin codes API endpoint
export async function POST(request: NextRequest) {
  try {
    // 1. Получаем пароль и убираем случайные пробелы
    const authHeader = request.headers.get('authorization') || '';
    const providedToken = authHeader.replace('Bearer ', '').trim();
    const expectedPassword = (process.env.ADMIN_PASSWORD || '').trim();

    // 2. Проверяем пароль
    if (!expectedPassword || providedToken !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получаем все коды
    const codes = await db.select().from(activationCodes).orderBy(activationCodes.createdAt);

    return NextResponse.json({ 
      success: true, 
      codes,
      message: 'Codes loaded successfully' 
    });
  } catch (error) {
    console.error('Error loading codes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load codes' 
    }, { status: 500 });
  }
}

