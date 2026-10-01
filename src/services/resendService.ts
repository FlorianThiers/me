export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export interface ResendResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send email via Resend through the Vercel serverless route (/api/contact).
 * API key stays server-side (RESEND_API_KEY), not in the client bundle.
 */
export const sendEmailViaResend = async (emailData: EmailData): Promise<ResendResponse> => {
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
    console.error('Resend Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email. Please try again later.',
    };
  }
};
