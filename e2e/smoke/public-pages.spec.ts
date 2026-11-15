import { expect, test } from '@playwright/test';

/** Public routes only (no login, no forms). */
const PUBLIC_PATHS = ['/', '/links', '/portfolio', '/skills'] as const;

for (const path of PUBLIC_PATHS) {
  test(`GET ${path} — HTTP 200 and no console errors`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Expected 2xx for ${path}`).toBe(true);
    expect(consoleErrors, `Console errors on ${path}`).toEqual([]);
  });
}