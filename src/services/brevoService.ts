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
 * Send email via Brevo (Sendinblue) API
 * Free tier: 300 emails/day, no domain limit
 */
export const sendEmailViaBrevo = async (emailData: EmailData): Promise<BrevoResponse> => {
  const API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
  const FROM_EMAIL = import.meta.env.VITE_BREVO_FROM_EMAIL || 'onboarding@brevo.com';
  const TO_EMAIL = import.meta.env.VITE_BREVO_TO_EMAIL || 'florthiers@gmail.com';

  // Validate configuration
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'Brevo API key is not configured. Please add VITE_BREVO_API_KEY to your .env file.'
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Portfolio Contact Form',
          email: FROM_EMAIL
        },
        to: [
          {
            email: TO_EMAIL,
            name: 'Florian Thiers'
          }
        ],
        replyTo: {
          email: emailData.email,
          name: emailData.name
        },
        subject: `Contact Form: ${emailData.name}`,
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${emailData.name}</p>
          <p><strong>Email:</strong> ${emailData.email}</p>
          <p><strong>Message:</strong></p>
          <p>${emailData.message.replace(/\n/g, '<br>')}</p>
        `,
        textContent: `
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
    console.error('Brevo Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email. Please try again later.'
    };
  }
};
