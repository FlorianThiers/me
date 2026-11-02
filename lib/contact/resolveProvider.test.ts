import { describe, expect, it } from 'vitest';
import { resolveContactEmailProvider } from './resolveProvider.js';

describe('resolveContactEmailProvider', () => {
  it('prefers Resend when both keys are set', () => {
    expect(
      resolveContactEmailProvider({ RESEND_API_KEY: 're_x', BREVO_API_KEY: 'xkeysib_x' }),
    ).toBe('resend');
  });

  it('uses Brevo when only Brevo is set', () => {
    expect(resolveContactEmailProvider({ BREVO_API_KEY: 'xkeysib_x' })).toBe('brevo');
  });

  it('returns null when no provider key is set', () => {
    expect(resolveContactEmailProvider({})).toBeNull();
  });
});
