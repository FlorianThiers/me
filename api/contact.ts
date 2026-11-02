import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveContactEmailProvider, type ContactEmailProvider } from '../lib/contact/resolveProvider.js';

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function contactAddresses(provider: ContactEmailProvider) {
  if (provider === 'brevo') {
    return {
      from:
        process.env.BREVO_FROM_EMAIL?.trim() ||
        process.env.RESEND_FROM_EMAIL?.trim() ||
        'florthiers@gmail.com',
      to:
        process.env.BREVO_TO_EMAIL?.trim() ||
        process.env.RESEND_TO_EMAIL?.trim() ||
        'florthiers@gmail.com',
    };
  }
  return {
    from:
      process.env.RESEND_FROM_EMAIL?.trim() ||
      process.env.BREVO_FROM_EMAIL?.trim() ||
      'florthiers@gmail.com',
    to:
      process.env.RESEND_TO_EMAIL?.trim() ||
      process.env.BREVO_TO_EMAIL?.trim() ||
      'florthiers@gmail.com',
  };
}

async function sendViaResend(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  replyTo: string,
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `Portfolio Contact Form <${fromEmail}>`,
      to: [toEmail],
      reply_to: replyTo,
      subject,
      html: htmlContent,
      text: textContent,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { message?: string };
  return { response, data };
}

async function sendViaBrevo(
  apiKey: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  replyTo: string,
) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: 'Portfolio Contact Form', email: fromEmail },
      to: [{ email: toEmail }],
      replyTo: { email: replyTo },
      subject,
      htmlContent,
      textContent,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { message?: string; code?: string };
  return { response, data };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const provider = resolveContactEmailProvider(process.env);
  if (!provider) {
    return res.status(503).json({
      success: false,
      error:
        'Contact form is not configured yet (set BREVO_API_KEY or optionally RESEND_API_KEY on the server).',
    });
  }

  const apiKey =
    provider === 'brevo'
      ? process.env.BREVO_API_KEY!.trim()
      : process.env.RESEND_API_KEY!.trim();

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as ContactPayload;
  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
  }

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ success: false, error: 'Message is too long.' });
  }

  const { from, to } = contactAddresses(provider);
  const subject = `Contact Form: ${name}`;
  const textContent = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  try {
    const { response, data } =
      provider === 'brevo'
        ? await sendViaBrevo(apiKey, from, to, subject, htmlContent, textContent, email)
        : await sendViaResend(apiKey, from, to, subject, htmlContent, textContent, email);

    if (!response.ok) {
      const errMsg =
        (data as { message?: string }).message ||
        (data as { code?: string }).code ||
        'Failed to send email.';
      return res.status(response.status).json({ success: false, error: errMsg });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
      provider,
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to send email. Please try again later.' });
  }
}
