export type ContactEmailProvider = 'brevo' | 'resend';

/** Brevo when configured; otherwise Resend if RESEND_API_KEY is set. */
export function resolveContactEmailProvider(env: {
  BREVO_API_KEY?: string;
  RESEND_API_KEY?: string;
}): ContactEmailProvider | null {
  if (env.BREVO_API_KEY?.trim()) return 'brevo';
  if (env.RESEND_API_KEY?.trim()) return 'resend';
  return null;
}
