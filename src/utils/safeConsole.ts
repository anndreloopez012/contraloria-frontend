/**
 * Global console sanitizer to prevent leaking URLs, file paths, or routes in logs.
 * Replaces any detected URLs/paths with redacted placeholders.
 */

const URL_REGEX = /(https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|tel:[^\s"'<>]+)/gi;
const FILE_REGEX = /\b[^\s"'<>]+\.(?:pdf|png|jpe?g|gif|webp|svg|mp4|webm|mov|avi|mkv|docx?|xlsx?|pptx?)\b/gi;
// Capture leading whitespace to preserve spacing
const PATH_REGEX = /(^|\s)(?:\.{0,2}\/[^\s"'<>]+|\/[\w./-]+)(?=(\s|$))/g;
function sanitizeString(input: string): string {
  let out = input;
  out = out.replace(URL_REGEX, '[REDACTED_URL]');
  out = out.replace(FILE_REGEX, '[REDACTED_FILE]');
  out = out.replace(PATH_REGEX, (_m, prefix) => `${prefix}[REDACTED_PATH]`);
  return out;
}

function sanitizeArgs(args: unknown[]): string {
  const parts = args.map((arg) => {
    if (typeof arg === 'string') return sanitizeString(arg);
    try {
      return sanitizeString(
        JSON.stringify(arg, (_key, value) => (typeof value === 'string' ? sanitizeString(value) : value))
      );
    } catch {
      try {
        return sanitizeString(String(arg));
      } catch {
        return '[REDACTED]';
      }
    }
  });
  return parts.join(' ');
}

export function installSafeConsoleFilter(): void {
  if ((window as any).__safeConsoleInstalled) return;
  (window as any).__safeConsoleInstalled = true;

  const original = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  } as const;

  const MAX_JSON_LENGTH = 200;
  const looksLikeJson = (s: string) => (s.includes('{') || s.includes('[')) && (s.includes('}') || s.includes(']'));
  const shouldSuppress = (msg: string) => {
    const keywords = /(api|strapi|response|request|fetch|headers|payload|transformando|datos|slider|imagen|pdf|video|youtube|cdn-cgi|NS_BINDING_ABORTED|atr\?ns=yt|log_event|ErrorUtils|fburl\.com)/i;
    if (keywords.test(msg)) return true;
    if (msg.includes('[REDACTED_URL]') || msg.includes('[REDACTED_PATH]') || msg.includes('[REDACTED_FILE]')) return true;
    if (looksLikeJson(msg) && msg.length > MAX_JSON_LENGTH) return true;
    // Suprimir errores de tracking de YouTube y Cloudflare
    if (msg.includes('youtube.com/api/stats') || msg.includes('youtube.com/youtubei') || msg.includes('cdn-cgi/rum')) return true;
    // Suprimir errores internos del SDK de Facebook
    if (msg.includes('Could not find element') && msg.includes('__elem_')) return true;
    if (msg.includes('ErrorUtils caught') || msg.includes('fburl.com/debugjs')) return true;
    return false;
  };

  const wrap = (fn: (msg: string) => void) =>
    (...args: unknown[]) => {
      const msg = sanitizeArgs(args);
      if (shouldSuppress(msg)) return; // Do not log
      fn(msg);
    };

  console.log = wrap(original.log) as any;
  console.info = wrap(original.info) as any;
  console.warn = wrap(original.warn) as any;
  console.error = wrap(original.error) as any;
  console.debug = wrap(original.debug) as any;
}

export default installSafeConsoleFilter;
