export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export interface BrevoResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send email via Brevo through the Vercel serverless route (/api/contact).
 * API key stays server-side (BREVO_API_KEY), not in the client bundle.
 */
export const sendEmailViaBrevo = async (emailData: EmailData): Promise<BrevoResponse> => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Failed to send email: ${response.statusText}`,
      };
    }

    return {
      success: true,
      message: data.message || 'Email sent successfully!',
    };
  } catch (error: unknown) {
    console.error('Brevo Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email. Please try again later.',
    };
  }
};
