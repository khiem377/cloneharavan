/**
 * Zero-dependency Lightweight HTML Sanitizer for Next.js (SSR & Client Safe)
 * Tẩy sạch các nguy cơ XSS: script injection, inline event handlers (onerror, onload),
 * javascript: pseudo-protocols, iframes, and malicious object/embed tags.
 * Giữ nguyên các thẻ định dạng phong phú (Rich Text: p, h1-h6, img, table, b, i, ul, li...)
 */
export function sanitizeHtml(html = '') {
  if (!html || typeof html !== 'string') return '';

  let clean = html;

  // 1. Loại bỏ các thẻ script thực thi mã độc
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Loại bỏ các thẻ nhúng nguy hiểm (iframe, object, embed, applet, meta, base)
  clean = clean.replace(/<\/?(iframe|object|embed|applet|meta|base|form|input|button)\b[^>]*>/gi, '');

  // 3. Loại bỏ toàn bộ thuộc tính inline event handlers (onload, onerror, onclick, onmouseover, onfocus...)
  clean = clean.replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Loại bỏ các đường dẫn thực thi script: javascript:... hoặc vbscript:... trong href và src
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'data:text\/html[^']*'|"data:text\/html[^"]*"|data:text\/html[^\s>]+)/gi, ' $1="#"');

  return clean;
}

export default sanitizeHtml;
