import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || process.env.BREVO_FROM_EMAIL || 'florthiers@gmail.com';
  const toEmail =
    process.env.RESEND_TO_EMAIL || process.env.BREVO_TO_EMAIL || 'florthiers@gmail.com';

  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: 'Contact form is not configured yet.',
    });
  }

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
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Portfolio Contact Form <${fromEmail}>`,
        to: [toEmail],
        reply_to: email,
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { message?: string; id?: string };

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Failed to send email.',
      });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch {
    return res.status(500).json({ success: false, error: 'Failed to send email. Please try again later.' });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
