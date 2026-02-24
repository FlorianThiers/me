export interface EmailData {
  name: string;
  email: string;
  message: string;
}

export interface FormspreeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send email via Formspree
 * Free tier: 50 submissions/month, no SMS verification needed
 * Get your form ID from: https://formspree.io
 */
export const sendEmailViaFormspree = async (emailData: EmailData): Promise<FormspreeResponse> => {
  const FORM_ID = import.meta.env.VITE_FORMSPREE_FORM_ID || '';

  // Validate configuration
  if (!FORM_ID || FORM_ID === '') {
    return {
      success: false,
      error: 'Formspree form ID is not configured. Please add VITE_FORMSPREE_FORM_ID to your .env file.'
    };
  }

  try {
    const response = await fetch(`https://formspree.io/f/${FORM_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: emailData.name,
        email: emailData.email,
        message: emailData.message,
        _subject: `Contact Form: ${emailData.name}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Failed to send email: ${response.statusText}`
      };
    }

    return {
      success: true,
      message: 'Email sent successfully!'
    };
  } catch (error: any) {
    console.error('Formspree Error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email. Please try again later.'
    };
  }
};
