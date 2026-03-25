# PLANNER.md — Project Planning Template

> **Instructions for Claude:** Read this file in full, then ask the user for their project details. Use every section below as a structured lens to produce a complete project plan. Output the plan as a filled version of this template. Never skip a section; use `TBD` if information is unavailable.

---

## 1. PROJECT IDENTITY

```
Name:
Type:               # web app / CLI / library / API / mobile / data pipeline / other
Primary Language:
Runtime / Platform:
Owner / Team:
Start Date:
Target Release:
```

---

## 2. PROBLEM & GOALS

**Problem Statement** *(1–2 sentences — what pain does this solve?)*

**Success Criteria** *(measurable outcomes)*
- [ ]
- [ ]

**Out of Scope**
-

---

## 3. ARCHITECTURE

**Pattern:** *(MVC / Clean / Hexagonal / Microservices / Monolith / Serverless / other)*

**Layer Map:**
```
UI / Client
    ↓
API / Controller
    ↓
Service / Domain
    ↓
Repository / Infra
    ↓
Database / External
```

**Key Design Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | | |
| Auth strategy | | |
| Data storage | | |
| Caching | | |
| Error handling | | |

**External Dependencies / APIs:**
-

---

## 4. DATA MODEL

List core entities and their key fields. Flag sensitive fields (PII, secrets).

```
Entity: <Name>
  - id: uuid
  - <field>: <type>   # sensitive? yes/no
```

**Validation rules:**
-

---

## 5. DEVELOPMENT LIFECYCLE

```
Phase 1 — Foundation
  [ ] Repo setup, branching strategy (GitFlow / trunk-based)
  [ ] CI pipeline scaffold
  [ ] Linting, formatting, pre-commit hooks
  [ ] Environment config (.env schema, secrets management)

Phase 2 — Core Features
  [ ] Domain models + business logic
  [ ] API / service layer
  [ ] Persistence layer

Phase 3 — Integration & UX
  [ ] Frontend / consumer integration
  [ ] Third-party service wiring
  [ ] Error boundaries + logging

Phase 4 — Hardening
  [ ] Security review (auth, input validation, dependency audit)
  [ ] Performance profiling
  [ ] Accessibility / compliance check

Phase 5 — Release
  [ ] Staging deployment + smoke tests
  [ ] Documentation freeze
  [ ] Production deploy + rollback plan
  [ ] Post-launch monitoring
```

**Branching:** `main` → `develop` → `feature/*` | `fix/*` | `chore/*`
**PR Rules:** Require review + passing CI before merge.

---

## 6. TESTING STRATEGY

| Layer | Tool | Coverage Target | When Runs |
|-------|------|----------------|-----------|
| Unit | | ≥ 80% | Every commit |
| Integration | | key flows | PR |
| E2E | | critical paths | Pre-release |
| Performance | | p95 < X ms | Weekly |
| Security | | OWASP Top 10 | Pre-release |

**Test principles:**
- Arrange / Act / Assert structure
- No logic in tests — only assertions
- Mock at the boundary (infra), not inside domain
- Each test is independent; no shared mutable state

---

## 7. API / INTERFACE CONTRACT

For each public surface:

```
Endpoint / Function:
  Method:
  Input schema:
  Output schema:
  Error codes:
  Auth required:
  Rate limit:
```

Versioning strategy: *(URI v1 / header / semver)*

---

## 8. SECURITY CHECKLIST

- [ ] Secrets never in source — use env vars / secrets manager
- [ ] All inputs validated and sanitized
- [ ] Auth + authz on every protected route
- [ ] HTTPS enforced; no mixed content
- [ ] Dependencies audited (`npm audit` / `pip-audit` / `cargo audit`)
- [ ] Principle of least privilege for DB and service accounts
- [ ] Rate limiting and brute-force protection
- [ ] Sensitive data encrypted at rest and in transit

---

## 9. DOCUMENTATION STANDARDS

| Artifact | Owner | Location |
|----------|-------|----------|
| README (setup + usage) | | `/README.md` |
| Architecture decision records | | `/docs/adr/` |
| API reference | | auto-generated or `/docs/api/` |
| Changelog | | `/CHANGELOG.md` |
| Runbook (ops) | | `/docs/runbook.md` |

**Code comments:** Explain *why*, not *what*. JSDoc / docstrings on all public APIs.

---

## 10. MILESTONES & RISKS

| Milestone | Target Date | Done? |
|-----------|-------------|-------|
| Phase 1 complete | | [ ] |
| MVP feature-complete | | [ ] |
| Beta release | | [ ] |
| v1.0 production | | [ ] |

**Top Risks:**
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| | | | |

---

## 11. DEFINITION OF DONE

A task is done when:
- [ ] Code reviewed and merged to `develop`
- [ ] Unit + integration tests pass
- [ ] No new linting errors
- [ ] Relevant docs updated
- [ ] Feature flagged or behind a toggle if experimental
