export const contentSecurityPolicy = [
  "default-src 'none'", "script-src 'self'", "style-src 'self'",
  "img-src 'self' data:", "font-src 'self'", "connect-src 'none'",
  "object-src 'none'", "base-uri 'none'", "form-action 'none'",
  "frame-ancestors 'none'", "worker-src 'none'", "manifest-src 'none'"
].join('; ');
export const securityHeaders = Object.freeze({
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
});
export const publicAssets = Object.freeze([
  'index.html', 'styles.css', 'dark.css', 'app.js', 'course.js',
  'progress.js', 'theme.js', 'html.js'
]);
