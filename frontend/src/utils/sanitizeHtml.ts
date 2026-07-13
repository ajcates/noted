import DOMPurify from 'dompurify';

/**
 * Markdown is rendered to HTML before it reaches Vue's v-html directive.
 * Keep the allow-list deliberately limited to regular HTML: SVG and MathML
 * have a larger scripting surface and are not needed for note previews.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
