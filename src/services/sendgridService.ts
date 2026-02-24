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
 * Send email via SendGrid API
 * Free tier: 100 emails/day, no domain limit
 */
export const sendEmailViaSendGrid = async (emailData: EmailData): Promise<SendGridResponse> => {
  const API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || '';
  const FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@example.com';
  const TO_EMAIL = import.meta.env.VITE_SENDGRID_TO_EMAIL || 'florthiers@gmail.com';

  // Validate configuration
  if (!API_KEY || API_KEY === '') {
    return {
      success: false,
      error: 'SendGrid API key is not configured. Please add VITE_SENDGRID_API_KEY to your .env file.'
    };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: TO_EMAIL,
                name: 'Florian Thiers'
              }
            ],
            reply_to: {
              email: emailData.email,
              name: emailData.name
            }
          }
        ],
        from: {
          email: FROM_EMAIL,
          name: 'Portfolio Contact Form'
        },
        subject: `Contact Form: ${emailData.name}`,
        content: [
          {
            type: 'text/plain',
            value: `
New Contact Form Submission

Name: ${emailData.name}
Email: ${emailData.email}

Message:
${emailData.message}
            `.trim()
          },
          {
            type: 'text/html',
            value: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${emailData.name}</p>
              <p><strong>Email:</strong> ${emailData.email}</p>
              <p><strong>Message:</strong></p>
              <p>${emailData.message.replace(/\n/g, '<br>')}</p>
            `
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to send email: ${response.statusText}. ${errorText}`
      };
    }

    return {
      success: true,
      message: 'Email sent successfully!'
    };
  } catch (error: any) {
    console.error('SendGrid Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email. Please try again later.'
    };
  }
};
