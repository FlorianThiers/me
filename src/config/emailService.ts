// Email Service Configuration
// Production contact form → /api/contact (BREVO_* on Vercel; RESEND_* optional fallback).
export const EMAIL_SERVICE = (import.meta.env.VITE_EMAIL_SERVICE || 'resend') as
  | 'brevo'
  | 'web3forms'
  | 'formspree'
  | 'sendgrid'
  | 'resend';

// Export the service name for use in components
export const getEmailService = () => EMAIL_SERVICE;
