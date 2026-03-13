# Security Policy

## Supported Versions

| Version | Supported |
|---------|----------|
| latest (main branch) | ✅ |
| older releases | ❌ |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Email: security@toolsai.dev

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (optional)

We will respond within **48 hours** and aim to patch within **7 days** for critical issues.

## Scope

In scope:
- XSS via tool URL fields (unsanitized href rendering)
- Data integrity issues in tools.json / pipeline
- Supply chain attacks via compromised dependencies
- Secrets exposure via env vars or committed files

Out of scope (static site, no backend):
- SQL injection (no database)
- Server-side vulnerabilities (no server)
- Rate limiting (no API endpoints)

## Automated Security

- Dependabot monitors all npm + GitHub Actions dependencies weekly
- Patch and minor updates auto-merge after CI passes
- Major updates require manual review
- All external URLs sanitized via `sanitizeUrl()` (https:// only)
- Security headers enforced via `public/_headers` (Cloudflare Pages)

## Security Headers (Cloudflare Pages)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## For Contributors

- Never commit `.env` files
- Never hardcode API keys or tokens
- All tool URLs must pass `sanitizeUrl()` before render
- `null` is valid for unverified compliance fields — never guess/fabricate data
