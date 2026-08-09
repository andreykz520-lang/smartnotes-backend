// Email sending utility using Resend (free tier: 100 emails/day)
// Alternative: Nodemailer with Gmail, SendGrid, etc.

interface SendActivationCodeParams {
  email: string;
  code: string;
  language?: 'en' | 'ru';
}

export async function sendActivationCodeEmail({ email, code, language = 'en' }: SendActivationCodeParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  // If no API key configured, skip email sending (graceful degradation)
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  const messages = {
    en: {
      subject: 'Your OBDIISCANAI PRO Activation Code',
      title: 'Thank you for your purchase!',
      intro: 'Your PRO activation code for OBDIISCANAI is ready:',
      instructions: 'To activate PRO features:',
      step1: 'Open the OBDIISCANAI app on your Android device',
      step2: 'Go to Settings > Upgrade to PRO',
      step3: 'Enter this activation code',
      step4: 'Enjoy all advanced AI-powered features!',
      support: 'Need help? Contact us at support@obdiiscanai.com',
      footer: 'This code is valid for one device only.',
    },
    ru: {
      subject: 'Ваш код активации OBDIISCANAI PRO',
      title: 'Спасибо за покупку!',
      intro: 'Ваш код активации PRO для OBDIISCANAI готов:',
      instructions: 'Чтобы активировать PRO функции:',
      step1: 'Откройте приложение OBDIISCANAI на вашем Android устройстве',
      step2: 'Перейдите в Настройки > Обновить до PRO',
      step3: 'Введите этот код активации',
      step4: 'Наслаждайтесь всеми продвинутыми ИИ-функциями!',
      support: 'Нужна помощь? Свяжитесь с нами: support@obdiiscanai.com',
      footer: 'Этот код действителен только для одного устройства.',
    },
  };

  const t = messages[language];

  const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 10px 0 0 0; font-size: 28px; }
    .header .logo { font-size: 48px; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; margin: 10px 0; }
    .instructions { background: #e8eaf6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .instructions ol { margin: 10px 0; padding-left: 20px; }
    .instructions li { margin: 8px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    @media only screen and (max-width: 600px) {
      .container { margin: 10px; }
      .content { padding: 20px 15px; }
      .code { font-size: 24px; letter-spacing: 2px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚗</div>
      <h1>OBDIISCANAI PRO</h1>
    </div>
    <div class="content">
      <h2>${t.title}</h2>
      <p>${t.intro}</p>
      
      <div class="code-box">
        <p style="margin: 0; color: #666; font-size: 14px;">${language === 'ru' ? 'Ваш код активации:' : 'Your Activation Code:'}</p>
        <div class="code">${code}</div>
      </div>

      <div class="instructions">
        <strong>${t.instructions}</strong>
        <ol>
          <li>${t.step1}</li>
          <li>${t.step2}</li>
          <li>${t.step3}</li>
          <li>${t.step4}</li>
        </ol>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${t.support}
      </p>
    </div>
    <div class="footer">
      ${t.footer}<br>
      © ${new Date().getFullYear()} OBDIISCANAI. ${language === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'OBDIISCANAI <noreply@obd2scanai.online>', // Используем ваш верифицированный домен
        to: email,
        subject: t.subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return { success: false, error: 'Failed to send email' };
    }

    const data = await response.json();
    console.log('Email sent successfully:', data);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: 'Email sending failed' };
  }
}
