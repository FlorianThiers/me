// Resend Configuration
export const RESEND_CONFIG = {
  API_KEY: import.meta.env.VITE_RESEND_API_KEY || '',
  FROM_EMAIL: import.meta.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  TO_EMAIL: import.meta.env.VITE_RESEND_TO_EMAIL || 'florthiers@gmail.com'
};
