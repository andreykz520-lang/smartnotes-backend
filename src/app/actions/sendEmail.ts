'use server';

import { Resend } from 'resend';
import ProActivationEmail from '@/emails/ProActivationEmail';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCodeToUser(
  email: string,
  generatedCode: string,
  language: 'en' | 'ru' = 'ru'
) {
  try {
    // Используем React-компонент для генерации HTML
    const emailHtml = await render(ProActivationEmail({ code: generatedCode, language }));

    const { data, error } = await resend.emails.send({
      from: `OBDIISCANAI <noreply@obd2scanai.online>`,
      to: [email],
      subject: language === 'ru' ? 'Ваш код активации PRO 👑 - OBDIISCANAI' : 'Your PRO Activation Code 👑 - OBDIISCANAI',
      html: emailHtml,
    });

    if (error) {
      console.error('Ошибка Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Критическая ошибка отправки:', error);
    return { success: false, error: 'Не удалось отправить письмо' };
  }
}
