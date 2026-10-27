# Security and deployment

## Scope

Hǎo is a static browser app. There are no accounts, API endpoints, uploads, payments, server-side learner records, third-party scripts, analytics, or runtime package dependencies. Progress and the theme preference stay in the visitor's browser. The hosting provider still receives normal page requests and may keep access logs.

Local progress is a convenience, not trusted evidence of achievement. A visitor can edit their own browser data. Do not use this version to issue verified certificates or make access decisions.

## Controls in this version

- Dynamic course text is HTML-escaped at rendering boundaries. Search text is compared as text; learner answers are never interpolated into HTML.
- A restrictive Content Security Policy allows local scripts and styles, denies outgoing connections, inline scripts, eval, frames, objects, workers, and form submissions. Trusted data-URL images are permitted for the favicon.
- Headers deny framing and MIME sniffing, suppress referrers, restrict device permissions and isolate cross-origin resources.
- The Node preview server only serves an explicit list of public files, accepts GET/HEAD, rejects malformed and traversal paths, and limits header size and request time. It binds only to loopback.
- Browser progress is bounded before parsing, validated on load and restricted to known lesson/word IDs. Prototype-related keys and invalid scores are discarded.
- The build exports only public files. Unknown existing files in `dist/` stop the build for review. Secrets, Git metadata, scratch files and server implementation are not included.
- Environment files, local work files and generated output are ignored by Git. No credentials belong in source code, `dist/`, browser storage, or frontend environment variables.

## Publishing safely

1. Run `node --test` and `node scripts/build.js` with a supported, patched Node.js version.
2. Deploy **only `dist/`** to an HTTPS static host. Never use the repository root as the public document root or expose the local preview server directly.
3. Cloudflare Pages can read the generated `_headers` file. Use build command `node scripts/build.js` and output directory `dist`. For another host, configure every header from `dist/_headers` through that provider's settings. `_headers` is not a universal web-server configuration.
4. Enable HTTPS and redirect HTTP to HTTPS at the host. HSTS is included for HTTPS hosting, without preload or includeSubDomains assumptions.
5. Verify the actual deployed response headers in browser developer tools. Confirm that `/.git/config`, `/.env` and `/work/` do not expose files. Check every view and an exercise under the deployed CSP. Do not add analytics or hosting script injection without reviewing the policy and privacy impact.
6. Keep the hosting account protected with appropriate access controls and maintain the runtime/toolchain. Changes involving accounts, audio services, uploads or a backend need a fresh security review.

The private GitHub repository can stay private while the built website is public. Neither the build nor the tests deploy the app or change repository visibility.

## Validation and limits

Automated tests cover the public-file allowlist, raw/encoded traversal attempts, malformed paths, blocked methods, security headers, HEAD responses, HTML escaping, tampered local storage and build contents. They complement course integrity and progression tests. These checks are not a penetration test or a guarantee that no vulnerability exists. TLS, CDN behaviour, account access and actual deployed headers must be verified on the chosen host after deployment.

For a suspected issue, contact the repository owner privately through an available private channel. Avoid posting credentials or exploit details publicly. This project does not currently provide a dedicated security inbox or promise a response time.

References: [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy), [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/).
