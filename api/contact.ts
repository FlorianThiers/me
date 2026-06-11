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

  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL || 'florthiers@gmail.com';
  const toEmail = process.env.BREVO_TO_EMAIL || 'florthiers@gmail.com';

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

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: 'Portfolio Contact Form',
          email: fromEmail,
        },
        to: [{ email: toEmail, name: 'Florian Thiers' }],
        replyTo: { email, name },
        subject: `Contact Form: ${name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
        textContent: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: (data as { message?: string }).message || 'Failed to send email.',
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
