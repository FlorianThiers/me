import { describe, expect, it } from 'vitest';
import { resolveContactEmailProvider } from './resolveProvider.js';

describe('resolveContactEmailProvider', () => {
  it('prefers Brevo when both keys are set', () => {
    expect(
      resolveContactEmailProvider({ BREVO_API_KEY: 'xkeysib_x', RESEND_API_KEY: 're_x' }),
    ).toBe('brevo');
  });

  it('uses Resend when only Resend is set', () => {
    expect(resolveContactEmailProvider({ RESEND_API_KEY: 're_x' })).toBe('resend');
  });

  it('uses Brevo when only Brevo is set', () => {
    expect(resolveContactEmailProvider({ BREVO_API_KEY: 'xkeysib_x' })).toBe('brevo');
  });

  it('returns null when no provider key is set', () => {
    expect(resolveContactEmailProvider({})).toBeNull();
  });
});
