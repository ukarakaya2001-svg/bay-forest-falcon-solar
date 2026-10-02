# Security and correctness fixes

Applied in this revision:

- Fixed HTML escaping in the Aether syntax highlighter (`&`, `<`, `>`, `"`, `'`). This closes the code-editor XSS path caused by rendering highlighted source with `dangerouslySetInnerHTML`.
- Added a highlight-HTML sanitizer that only allows `span.tok-*` tags, so a future highlighter bug cannot reintroduce markup.
- Bounded highlighter input so oversized editor content is truncated before DOM insertion.
- Added regression coverage proving HTML-looking Aether source is rendered as escaped text rather than executable markup.
- Prevented generated entry-point targets (Go, C, C++, Rust, Swift, Java, C#, Haskell) from emitting a second `main` declaration when the Aether source already declares `main`.
- Stopped omitted Aether function return types from being silently mapped to an integer return type.
- Fixed top-level Java type declarations so they are not emitted as `static class` outside a containing class.
- Fixed Go generation so `fmt` is imported only when printing is actually used.
- Fixed Lua function block generation so `function main()` is not emitted as `function main() then`.
- Added a 1,000,000-character lexer/highlighter input ceiling to bound CPU/memory exposure from oversized editor input.
- Interpreter now bounds steps, recursion depth, collection size, string size, output lines/bytes, range allocation, and cyclic value rendering.
- Added response hardening headers to deployed PWA document/manifest responses (`nosniff`, strict referrer policy, restrictive permissions policy, COOP).
- Hardened the auth popup completion response with `no-store`, `nosniff`, `no-referrer`, COOP and a nonce CSP; the popup token payload is still `<`-escaped before embedding.
- Closed an iframe `postMessage` trust boundary issue: sandbox previews no longer accept arbitrary parent origins merely because the guest host is `*.grok-sandbox.com`.
- Validated the live OAuth popup redirect against the configured broker origin and HTTPS before emitting a `Location` header.
- Removed localhost origins from the deployed Better Auth trusted-origin list when an explicit production `BETTER_AUTH_URL` is configured.
- Removed the hardcoded preview OAuth client secret from source. Credentials come from runtime env only.
- Restricted explicit connector forwarding URLs to the official HTTPS production/staging connector hosts and rejected URLs containing credentials.
- Restricted connector-provided sign-in URLs to the official HTTPS gate hosts and exact `/__gate/signin` path.
- OAuth callbacks, error callbacks and sign-out redirects are forced to same-origin paths. `javascript:` and off-site URLs are rejected.
- Popup `postMessage` requires the expected origin, the exact popup window source, and a plausible bearer token.
- Unknown OAuth providers are rejected on both the client and the popup server.
- Popup error pages no longer reflect raw backend/error-query strings.
- WebRTC signaling validates identifiers, signal kinds and payload size, authenticates peers with a hashed capability token, rate-limits, rejects cross-site posts, and requires `application/json`.
- ICE server URLs are allowlisted to `stun:` / `stuns:` only.
- Applied the TanStack Start 1.168.60 security floor.

Validation is recorded in `RELEASE_READINESS.md`.
