export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export interface Web3FormsResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send email via Web3Forms
 * Free, no API key needed, simple form service
 * Get your access key from: https://web3forms.com
 */
export const sendEmailViaWeb3Forms = async (emailData: EmailData): Promise<Web3FormsResponse> => {
  const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '';

  // Validate configuration
  if (!ACCESS_KEY || ACCESS_KEY === '') {
    return {
      success: false,
      error: 'Web3Forms access key is not configured. Please add VITE_WEB3FORMS_ACCESS_KEY to your .env file.'
    };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Contact Form: ${emailData.name}`,
        from_name: emailData.name,
        from_email: emailData.email,
        message: `
Name: ${emailData.name}
Email: ${emailData.email}

Message:
${emailData.message}
        `.trim(),
        // Optional: Set recipient email (defaults to your Web3Forms account email)
        to_email: import.meta.env.VITE_WEB3FORMS_TO_EMAIL || undefined
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
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
    console.error('Web3Forms Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email. Please try again later.'
    };
  }
};
