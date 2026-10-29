export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export interface SendGridResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Previously called SendGrid directly from the browser with a VITE_ key (leaked in bundle).
 * Now routes through the serverless /api/contact endpoint; keys live only on Vercel.
 */
export const sendEmailViaSendGrid = async (emailData: EmailData): Promise<SendGridResponse> => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
    const data = (await response.json().catch(() => ({}))) as SendGridResponse;
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to send email.' };
    }
    return { success: true, message: data.message || 'Email sent successfully!' };
  } catch {
    return { success: false, error: 'Failed to send email. Please try again later.' };
  }
};
