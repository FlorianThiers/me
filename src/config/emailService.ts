// Email Service Configuration
// Choose which email service to use: 'brevo' | 'web3forms' | 'formspree' | 'sendgrid' | 'resend'
export const EMAIL_SERVICE = (import.meta.env.VITE_EMAIL_SERVICE || 'web3forms') as 'brevo' | 'web3forms' | 'formspree' | 'sendgrid' | 'resend';

// Export the service name for use in components
export const getEmailService = () => EMAIL_SERVICE;
