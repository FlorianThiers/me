export type ContactEmailProvider = 'resend' | 'brevo';

export function resolveContactEmailProvider(env: {
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
}): ContactEmailProvider | null {
  if (env.RESEND_API_KEY?.trim()) return 'resend';
  if (env.BREVO_API_KEY?.trim()) return 'brevo';
  return null;
}
