import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes executable elements and event handlers', () => {
    const safe = sanitizeHtml('<p onclick="alert(1)">Safe</p><script>alert(1)</script>');

    expect(safe).toBe('<p>Safe</p>');
  });

  it('removes unsafe URL schemes and SVG payloads', () => {
    const safe = sanitizeHtml(
      '<a href="javascript:alert(1)">bad link</a><img src="x" onerror="alert(1)"><svg><script>alert(1)</script></svg>',
    );

    expect(safe).toContain('<a>bad link</a>');
    expect(safe).toContain('<img src="x">');
    expect(safe).not.toContain('javascript:');
    expect(safe).not.toContain('onerror');
    expect(safe).not.toContain('<svg');
  });
});
