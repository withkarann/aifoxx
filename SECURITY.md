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

- Dependabot checks all npm and GitHub Actions dependencies weekly.
- Nothing merges on its own. Every dependency change waits for a maintainer,
  the same as any other pull request.
- Major updates are held when they cannot build, with the reason recorded in
  `package.json`.
- All external URLs are sanitized via `sanitizeUrl()` (https:// only).
- Security headers are enforced via CDN config.

## Known advisories we cannot patch

Two advisories against React Router 6 have no fix inside the 6 line: both are
resolved in 7.18.0, and this project is held on the 6 line because the
static-site builder it uses requires it. Rather than leave that unexplained,
here is why neither is reachable here. Every claim below can be checked by
reading the repository.

**Open redirect via backslash in `<Link>` and `useNavigate`**
([GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)).
Reaching this needs a destination a visitor controls. No destination in this app
comes from a visitor. Every `navigate()` call and every `to=` target is either a
fixed path or a path built with `encodeURIComponent`, which turns a backslash
into `%5C` before it reaches the router. Grep for `navigate(` and `to={` under
`src/` to confirm.

**Arbitrary constructor injection via `deserializeErrors()` during hydration**
([GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg)).
Reaching this needs a server rendering pages on request and passing serialized
errors to the browser. Every page here is built to static HTML ahead of time and
served from a CDN. There is no server and no request-time rendering;
`renderToString` and `hydrateRoot` appear only in tests.

Both are reassessed whenever the builder gains support for React Router 7, at
which point the upgrade lands and this section goes away. If you can show either
is reachable, please report it: that changes the answer immediately.

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
