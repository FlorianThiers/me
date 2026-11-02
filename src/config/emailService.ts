// Email Service Configuration
// Production contact form: 'resend' | 'brevo' → server /api/contact (RESEND_API_KEY or BREVO_API_KEY on Vercel).
export const EMAIL_SERVICE = (import.meta.env.VITE_EMAIL_SERVICE || 'resend') as
  | 'brevo'
  | 'web3forms'
  | 'formspree'
  | 'sendgrid'
  | 'resend';

// Export the service name for use in components
export const getEmailService = () => EMAIL_SERVICE;
