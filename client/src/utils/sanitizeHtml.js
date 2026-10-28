

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'mark',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'img', 'figure', 'figcaption',
  'a', 'span', 'div', 'br', 'hr', 'section', 'article', 'aside'
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'class', 'classname', 'id', 'width', 'height',
  'target', 'rel', 'style', 'colspan', 'rowspan', 'align', 'valign', 'loading'
]);

const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|tel):|\/|#|\.)/i;
const DANGEROUS_PROTOCOLS = /^(?:javascript|vbscript|data|blob):/i;

function sanitizeWithDomParser(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const walk = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 1) { // ELEMENT_NODE
        const tagName = child.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tagName)) {
          child.remove();
          continue;
        }

        const attrs = Array.from(child.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          const cleanVal = attr.value.trim().replace(/[\x00-\x20]+/g, '');

          if (attrName.startsWith('on') || !ALLOWED_ATTRS.has(attrName)) {
            child.removeAttribute(attr.name);
          } else if (['href', 'src'].includes(attrName)) {
            if (DANGEROUS_PROTOCOLS.test(cleanVal) || !SAFE_URL_PATTERN.test(attr.value.trim())) {
              child.setAttribute(attr.name, '#');
            }
            if (attrName === 'href' && child.getAttribute('target') === '_blank') {
              child.setAttribute('rel', 'noopener noreferrer');
            }
          }
        }
        walk(child);
      } else if (child.nodeType === 8) { // COMMENT_NODE
        child.remove();
      }
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

function sanitizeWithRegex(html) {
  let clean = html;
  let prev;

  // Multi-pass để triệt tiêu triệt để nested tags (ví dụ: <scr<script>ipt>)
  let passes = 0;
  do {
    prev = clean;
    // 1. Loại bỏ chú thích HTML
    clean = clean.replace(/<!--[\s\S]*?-->/g, '');
    // 2. Loại bỏ các thẻ thực thi mã nguy hiểm và toàn bộ nội dung con của chúng
    clean = clean.replace(/<\s*(script|style|iframe|object|embed|applet|meta|base|link|form|input|button|select|textarea|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
    // 3. Loại bỏ các thẻ đơn / tự đóng độc hại
    clean = clean.replace(/<\s*\/?\s*(script|style|iframe|object|embed|applet|meta|base|link|form|input|button|select|textarea|svg|math|template|noscript)\b[^>]*>/gi, '');
    passes++;
  } while (clean !== prev && passes < 10);

  // 4. Loại bỏ toàn bộ inline event handlers (on* với mọi biến thể khoảng trắng hoặc dấu gạch chéo)
  clean = clean.replace(/[\s/]on[a-zA-Z0-9_\-]+(?:\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)|\s*(?=[/>\s]))/gi, ' ');

  // 5. Triệt tiêu các giao thức nguy hiểm trong href và src
  clean = clean.replace(/(\s(?:href|src)\s*=\s*['"])\s*(?:javascript|vbscript|data|blob):[^'"]*(['"])/gi, '$1#$2');
  clean = clean.replace(/(\s(?:href|src)\s*=\s*)(?:javascript|vbscript|data|blob):[^\s>]*/gi, '$1"#"');

  return clean;
}

export function sanitizeHtml(html = '') {
  if (!html || typeof html !== 'string') return '';

  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      return sanitizeWithDomParser(html);
    } catch {
      return sanitizeWithRegex(html);
    }
  }

  return sanitizeWithRegex(html);
}

export default sanitizeHtml;
