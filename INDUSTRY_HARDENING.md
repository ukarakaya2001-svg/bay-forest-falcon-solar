# Aether Production Hardening Baseline

This document records the production-oriented controls implemented in the
workspace. It is a baseline, not a security certification.

## Application security

- HTML output from the Aether syntax highlighter is entity-escaped, then
  sanitized to `span.tok-*` tags only, before DOM insertion.
- OAuth providers are allowlisted client-side and server-side.
- OAuth callback/error/sign-out destinations are restricted to same-origin paths.
- Popup messages require both the expected origin and the exact popup window source.
- Popup completion pages use `no-store`, `nosniff`, `no-referrer`, COOP and a nonce CSP.
- OAuth client secrets are runtime configuration only; no preview client secret is stored in source.
- WebRTC signaling validates identifiers, signal kinds, content-type and payload size.
- WebRTC rooms and inboxes have bounded peer/signal counts, hashed capability tokens, rate limits and TTL cleanup.
- Cross-origin and cross-site WebRTC requests are rejected.
- ICE configuration accepts only `stun:` / `stuns:` URLs.
- Connector forwarding is limited to official HTTPS gate hosts.
- Database access uses parameterized SQL.
- Document responses send `nosniff`, a restrictive Permissions-Policy, and COOP.

## Language runtime

- Source input is capped at 1,000,000 characters.
- Interpreter execution is step-bounded.
- Function recursion is depth-bounded.
- List/map/struct/range allocations are bounded.
- String concatenation is size-bounded.
- Output lines and output bytes are bounded.
- Cyclic values are rendered safely.
- Generated entry points are target-specific.

## Engineering controls

- Locked dependencies (`package-lock.json`).
- `.env.example` documents runtime secrets without shipping their values.
- `.gitignore` excludes credentials and build artifacts.
- `SECURITY.md` defines private vulnerability reporting and release gates.
- CI runs dependency installation, verification, linting, typechecking and build.
- High-severity production dependency audit is a CI gate.
- Transpiler compiler smoke tests are available for installed toolchains.
- TanStack Start is pinned at the 1.168.60 security floor.

## Verification

See `RELEASE_READINESS.md` for the latest measured results.
