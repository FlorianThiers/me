import { RESEND_CONFIG } from '../config/resend';

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
 * Send email via Resend API
 * Note: In production, this should be done via a backend endpoint for security
 */
export const sendEmailViaResend = async (emailData: EmailData): Promise<ResendResponse> => {
  // Validate configuration
  if (!RESEND_CONFIG.API_KEY || RESEND_CONFIG.API_KEY === '') {
    return {
      success: false,
      error: 'Resend API key is not configured. Please add VITE_RESEND_API_KEY to your .env file.'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        from: RESEND_CONFIG.FROM_EMAIL,
        to: RESEND_CONFIG.TO_EMAIL,
        reply_to: emailData.email,
        subject: `Contact Form: ${emailData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${emailData.name}</p>
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>Message:</strong></p>
          <p>${emailData.message.replace(/\n/g, '<br>')}</p>
        `,
        text: `
          New Contact Form Submission
          
          Name: ${emailData.name}
          Email: ${emailData.email}
          
          Message:
          ${emailData.message}
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Failed to send email: ${response.statusText}`
      };
    }

    return {
      success: true,
      message: 'Email sent successfully!'
    };
  } catch (error: any) {
    console.error('Resend Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email. Please try again later.'
    };
  }
};
