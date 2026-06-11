# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `main` (latest) | Yes |
| Older releases | No |

## Reporting a vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

| Channel | Use for |
|---|---|
| [GitHub Security Advisories](https://github.com/withkarann/aifoxx/security/advisories) | Preferred (private report) |
| [GitHub Discussions](https://github.com/withkarann/aifoxx/discussions) | Questions about security scope |
| Pull Request | If you have a fix ready |

Include in your report:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

We respond within 48 hours and patch critical issues within 7 days.

## Scope

In scope:

- XSS via unsanitized tool URL fields
- Data integrity issues in `tools.json`
- Supply chain attacks via compromised dependencies
- Secrets accidentally exposed in committed files

Out of scope (static site, no backend):

- SQL injection
- Server-side vulnerabilities
- Rate limiting

## Automated security

- Dependabot monitors all npm and GitHub Actions dependencies weekly.
- Patch and minor updates auto-merge after CI passes.
- Major updates require manual review.
- All external URLs are sanitized via `sanitizeUrl()` (https:// only).
- Security headers are enforced via CDN config.

## Security headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## For contributors

- Never commit `.env` files or API keys.
- All tool URLs must pass `sanitizeUrl()` before render.
- Use `null` for unverified compliance fields; never guess or fabricate data.
