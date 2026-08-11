import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log("Sending email...");
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'crawlerrobo@gmail.com', // Let's try sending to the user's test email
    subject: 'Test Email',
    html: '<p>Test</p>'
  });
  console.log({ data, error });
}
testEmail();
