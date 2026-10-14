# BudgetLoom — Application Security Review (`SECURITY_REVIEW.md`)

**Review Date:** 2026-10-14  
**Scope:** Authentication, Authorization, Database TLS, API Endpoints, CMS Sanitization, Rate Limiting, HTTP Headers, Secrets & Dependencies

---

## 1. Authentication & Session Management

| Control Area | Previous State | Hardened Implementation | Verification |
|---|---|---|---|
| **JWT Signing & Secret Strength** | `lib/auth.ts` enforced `JWT_SECRET.length >= 32` using `jose` (`HS256`), with 7-day token lifetime. | Retained strict `JWT_SECRET.length >= 32` validation (zero fallback secret), reduced session lifetime to `24h` (`setExpirationTime('24h')`), and added explicit `{ username, role: 'admin' }` claims. | Unit test in `tests/security-and-cms.test.mjs` |
| **Session Verification Endpoint (`GET /api/admin/auth`)** | Missing `GET` endpoint; `DashboardLayout` called `POST /api/admin/auth` with `{}`, which always returned `401` and caused an infinite redirect loop. | Implemented `GET /api/admin/auth` using `getAuthenticatedUser(request)` with `Cache-Control: no-store`. Updated `DashboardLayout` to check `res.ok && data.authenticated === true`. | Integration test in `tests/security-and-cms.test.mjs` |
| **Password Hashing** | `bcryptjs` with cost factor 12 in `/api/admin/init`. | Preserved `bcryptjs` cost factor 12; explicitly rejected documented legacy default credential `admin / admin123` in `POST /api/admin/auth` and removed the misleading hint from `app/admin/login/page.tsx`. | Verified in `app/api/admin/auth/route.ts` |
| **Cookie Security Flags** | `httpOnly: true`, `secure: NODE_ENV === 'production'`, `sameSite: 'strict'`, `path: '/'`. | Maintained strict cookie flags (`httpOnly`, `secure` in production, `sameSite: 'strict'`) and aligned `maxAge` to 24 hours (`86400` seconds). | Verified in `app/api/admin/auth/route.ts` |
| **Administrator Bootstrap (`/api/admin/init`)** | Required `ADMIN_SETUP_TOKEN` (>= 32 chars) via `timingSafeEqual` and `ADMIN_BOOTSTRAP_PASSWORD` (>= 16 chars); blocked `GET` with `405`. | Preserved constant-time token comparison and `409 Conflict` when `admin_users` already contains an account; added IP sliding-window rate limiting (`5 req / 15 min`) and audit logging. | Unit test in `tests/security-and-cms.test.mjs` |

---

## 2. Authorization, CSRF & Rate Limiting

- **Same-Origin CSRF Enforcement (`isSameOriginMutation`):** Every mutating request (`POST`, `PUT`, `DELETE`) across `/api/admin/*` validates that any present `Origin` header matches `request.nextUrl.origin`. Cross-origin requests are rejected and logged via `logger.security('auth.csrf.origin_mismatch')`.
- **Middleware / Proxy Boundary (`proxy.ts`):** All `/admin/dashboard/:path*` routes require a valid `admin_token` cookie verified via `jose.jwtVerify` before rendering.
- **Brute-Force & Abuse Rate Limiting (`checkRateLimit`):**
  - `POST /api/admin/auth`: Limited to 8 attempts per 15-minute window per client IP; returns `429 Too Many Requests` with `Retry-After` header.
  - `POST /api/admin/init`: Limited to 5 attempts per 15-minute window per client IP.
  - `POST /api/subscribe`: Limited to 5 attempts per 10-minute window per client IP plus hidden honeypot field (`company_website`) to trap automated spam bots.

---

## 3. Database Security, TLS Verification & SQL Injection Prevention

- **Parameterized Queries Only:** Every database query across `lib/db.ts`, `lib/content.ts`, and `app/api/**/*` uses parameterized `$1, $2, ...` placeholders. Zero string concatenation is used for user-supplied values.
- **Strict PostgreSQL TLS (`verify-full`):**
  - `normalizeDatabaseConfig()` in `lib/db.ts` validates the connection URL, rejects `sslmode=disable`, `allow`, `no-verify`, or `ssl=false`/`0` in production, upgrades `require`/`prefer`/`verify-ca` to `verify-full`, and configures `{ rejectUnauthorized: true, minVersion: 'TLSv1.2', servername: url.hostname }`.
  - Never uses `rejectUnauthorized: false`.
  - Attaches `pool.on('error', ...)` so idle client disconnects never crash the serverless runtime.
- **Zero SQL Error Leakage:** Replaced all instances of `NextResponse.json({ error: error.message }, { status: 500 })` in `app/api/admin/printables/*`, `app/api/admin/settings`, and `app/api/admin/seed` with generic user-safe error messages while logging redacted diagnostics server-side.

---

## 4. XSS Prevention, Content Sanitization & CSV Injection Protection

- **CMS Input Sanitization (`sanitizeContentInput`):** Strips `<script>`, `<iframe>`, `<object>`, inline `on*=` event handlers, and `javascript:` URIs on all CMS post and printable mutations before persistence.
- **Safe Advertising Rendering (`AdBanner.tsx` & `AdSlot.tsx`):** CMS ad placement textareas are never executed as HTML or JavaScript. Only validated `ca-pub-\d+` AdSense client IDs and numeric slot IDs from environment variables are rendered.
- **CSV Formula Injection Prevention (`csvCell`):** All CSV exports in calculators prepend `'` to any cell starting with `=`, `+`, `-`, `@`, `\t`, or `\r` and escape embedded double quotes.

---

## 5. HTTP Security Headers (`next.config.js`)

Configured site-wide response headers in `next.config.js`:
- `Content-Security-Policy`: Restricts `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, and allowlists only required font/analytics/AdSense origins.
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), browsing-topics=()`
