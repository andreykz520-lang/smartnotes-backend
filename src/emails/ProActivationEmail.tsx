import {
  Html,
  Body,
  Head,
  Container,
  Text,
  Section,
  Heading,
  Hr,
} from '@react-email/components';

export default function ProActivationEmail({
  code = 'PRO-TEST-1234',
  language = 'ru',
}: {
  code: string;
  language?: 'en' | 'ru';
}) {
  const t = messages[language];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.h1}</Heading>

          <Text style={text}>
            {t.greeting} <b>OBDIISCANAI</b>. {t.intro}
          </Text>

          {/* Блок с кодом */}
          <Section style={codeBox}>
            <Text style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              {t.yourCode}
            </Text>
            <Text style={codeText}>{code}</Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>{t.howToActivate}</Heading>

          <Section style={stepsContainer}>
            <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
              <li style={stepText}>
                <b>{t.step1Title}</b> {t.step1Desc}
              </li>
              <li style={stepText}>
                <b>{t.step2Title}</b> {t.step2Desc}
              </li>
              <li style={stepText}>
                <b>{t.step3Title}</b> {t.step3Desc}
              </li>
              <li style={stepText}>
                <b>{t.step4Title}</b> {t.step4Desc}
              </li>
            </ol>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            {t.support}
            {'\n'}
            {t.regards}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// --- Стили и тексты ---

const messages = {
  ru: {
    h1: 'Ваш код активации PRO 👑',
    greeting: 'Здравствуйте! Спасибо за покупку PRO-версии',
    intro: 'Ваш уникальный код активации сгенерирован и готов к использованию.',
    yourCode: 'Ваш код активации:',
    howToActivate: 'Как активировать PRO?',
    step1Title: '1. Откройте приложение:',
    step1Desc: 'Зайдите в установленное приложение OBDIISCANAI на вашем Android-устройстве.',
    step2Title: '2. Перейдите в настройки:',
    step2Desc: 'Откройте меню Настройки > "Обновить до PRO".',
    step3Title: '3. Введите код:',
    step3Desc: 'Скопируйте код выше, вставьте его в поле и нажмите кнопку активации.',
    step4Title: '4. Готово!',
    step4Desc: 'Приложение навсегда разблокирует продвинутые ИИ-функции, расшифровку ошибок и проверку здоровья авто.',
    support: 'Если у вас возникли проблемы с активацией, просто ответьте на это письмо, и наша поддержка вам поможет.',
    regards: 'С уважением, команда OBDIISCANAI.',
  },
  en: {
    h1: 'Your PRO Activation Code 👑',
    greeting: 'Hello! Thank you for purchasing the PRO version of',
    intro: 'Your unique activation code has been generated and is ready to use.',
    yourCode: 'Your activation code:',
    howToActivate: 'How to activate PRO?',
    step1Title: '1. Open the app:',
    step1Desc: 'Go to the installed OBDIISCANAI app on your Android device.',
    step2Title: '2. Go to settings:',
    step2Desc: 'Open the Settings menu > "Upgrade to PRO".',
    step3Title: '3. Enter the code:',
    step3Desc: 'Copy the code above, paste it into the field, and press the activation button.',
    step4Title: '4. Done!',
    step4Desc: 'The app will permanently unlock advanced AI features, error decoding, and car health checks.',
    support: 'If you have any problems with activation, just reply to this email, and our support will help you.',
    regards: 'Best regards, the OBDIISCANAI team.',
  },
};

// Простые стили для письма (CSS-in-JS, чтобы почтовики не ломали верстку)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
};
const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
};
const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
};
const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
};
const codeBox = {
  background: '#edf2f7',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '20px 0',
};
const codeText = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  color: '#2b6cb0',
  margin: '0',
};
const stepsContainer = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
};
const stepText = {
  color: '#444',
  fontSize: '15px',
  lineHeight: '22px',
  paddingLeft: '10px',
  // marginBottom: '12px',
};
const hr = {
  borderColor: '#e6ebf1',
  margin: '30px 0',
};
const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};
