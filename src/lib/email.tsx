import 'server-only';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';

type SendWelcomeEmailArgs = {
  to: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromAddress() {
  return process.env.RESEND_FROM ?? 'Zyra <no-reply@myzyra.xyz>';
}

export async function sendWelcomeEmail({ to }: SendWelcomeEmailArgs) {
  const resend = getResendClient();
  if (!resend) {
    // Keep error message generic to avoid leaking env var names.
    throw new Error('Email sending is not configured');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://myzyra.xyz';

  const html = await render(<WelcomeEmail appUrl={appUrl} />, {
    pretty: false,
  });
  const text = await render(<WelcomeEmail appUrl={appUrl} />, {
    plainText: true,
  });

  return await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Welcome to Zyra',
    html,
    text,
  });
}

