/**
 * Live-preview sign-in popup — server-only (NEVER import from the client).
 *
 * The sandbox preview runs the app in a partitioned iframe, so OAuth must happen
 * in a top-level popup (first-party cookies). This handler is the ENTIRE popup
 * document — no React shell:
 *
 *   Phase 1 (`?providerId=…`): start OAuth server-side and 302 straight to the
 *     broker / upstream login page. The popup never paints the app.
 *   Phase 2 (`?done=1`): after the broker round-trip, emit a tiny HTML page that
 *     posts the session token to the opener and closes. No SPA hydrate, no
 *     server-fn round-trip.
 *
 * Wired automatically by the Vite `authPopupPlugin` in `vite.config.ts` during
 * `npm run dev` (live preview). Do NOT create `src/routes/auth/popup.tsx` — a
 * React route here paints the full app shell in the popup. The opener lives in
 * `client.ts` (`signIn` → `openSignInPopup`).
 */
import { randomBytes } from "node:crypto";
import { auth, SESSION_TOKEN_COOKIE } from "./server";
import { GROK_PROVIDERS } from "./providers";

/** Message shape the popup posts to the opener (must match `client.ts`). */
type PopupMessage = {
  source: "grok-auth-popup";
  token: string | null;
  error?: string;
};

/**
 * Handle `GET /auth/popup`. Invoked by the Vite `authPopupPlugin` (dev / live
 * preview). Do not re-export this from a React route file.
 */
export async function handleAuthPopupRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const done = url.searchParams.get("done") === "1";

  if (done) {
    const errored = url.searchParams.has("error");
    const token = errored ? null : readCookie(request, SESSION_TOKEN_COOKIE);
    const rawError = url.searchParams.get("error") ?? "sign_in_failed";
    const safeError = /^[A-Za-z0-9._-]{1,64}$/.test(rawError) ? rawError : "sign_in_failed";
    const message: PopupMessage = {
      source: "grok-auth-popup",
      token: token && /^[\x21-\x7E]{16,4096}$/.test(token) ? token : null,
      ...(errored ? { error: safeError } : {}),
    };
    return completionResponse(message);
  }

  const providerId = url.searchParams.get("providerId")?.trim();
  if (!providerId || !GROK_PROVIDERS.some((provider) => provider.providerId === providerId)) {
    return new Response("Invalid providerId", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Stay first-party for the callback so the session cookie lands in THIS popup.
  const back = `${url.origin}/auth/popup?done=1`;
  try {
    const apiRes = await auth.api.signInWithOAuth2({
      body: {
        providerId,
        callbackURL: back,
        errorCallbackURL: `${back}&error=1`,
      },
      // Forward the preview host so Better Auth derives the correct baseURL /
      // redirect_uri for the dynamic `*.grok-sandbox.com` origin.
      headers: request.headers,
      asResponse: true,
    });

    if (!apiRes.ok) {
      await apiRes.text().catch(() => "");
      return completionResponse({
        source: "grok-auth-popup",
        token: null,
        error: "oauth_init_failed",
      });
    }

    const body = (await apiRes.json().catch(() => null)) as {
      url?: string;
    } | null;
    const location = body?.url;
    if (!location) {
      return completionResponse({
        source: "grok-auth-popup",
        token: null,
        error: "oauth_init_missing_url",
      });
    }

    // Better Auth generates the broker URL, but validate the destination before
    // reflecting it into a Location header. A compromised/misconfigured auth
    // response must never turn this endpoint into an arbitrary redirector.
    let redirect: URL;
    try {
      redirect = new URL(location);
    } catch {
      return completionResponse({
        source: "grok-auth-popup",
        token: null,
        error: "oauth_init_invalid_url",
      });
    }
    const issuer = new URL((process.env.GROK_AUTH_ISSUER ?? "https://auth.grok.me").replace(/\/+$/, ""));
    if (redirect.protocol !== "https:" || redirect.origin !== issuer.origin) {
      return completionResponse({
        source: "grok-auth-popup",
        token: null,
        error: "oauth_init_untrusted_url",
      });
    }

    // 302 to the broker (which headlessly forwards to Google/X). Forward any
    // Set-Cookie (OAuth state / PKCE) so the callback can complete in this popup.
    const headers = new Headers({ location: redirect.href, "cache-control": "no-store" });
    for (const cookie of apiRes.headers.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }
    return new Response(null, { status: 302, headers });
  } catch {
    return completionResponse({
      source: "grok-auth-popup",
      token: null,
      error: "oauth_init_failed",
    });
  }
}

function completionResponse(message: PopupMessage): Response {
  const nonce = randomBytes(16).toString("base64url");
  return new Response(completionHtml(message, nonce), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "cross-origin-opener-policy": "same-origin",
      "content-security-policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
      "x-frame-options": "DENY",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    },
  });
}

/** Minimal HTML: postMessage the token to the opener and close. No React. */
function completionHtml(message: PopupMessage, nonce: string): string {
  // JSON is safe inside a <script type="application/json"> block; the inline
  // script only reads it. Avoids escaping pitfalls of embedding in JS source.
  const payload = JSON.stringify(message).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Signing in…</title>
<style>
  html,body{margin:0;min-height:100%;background:#0b0b0c;color:#a1a1aa;
    font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
  main{min-height:100vh;display:grid;place-items:center;padding:1.5rem;text-align:center}
</style>
</head>
<body>
<main><p>Signing you in…</p></main>
<script type="application/json" id="grok-auth-popup-msg">${payload}</script>
<script nonce="${nonce}">
(function () {
  var el = document.getElementById("grok-auth-popup-msg");
  var msg = { source: "grok-auth-popup", token: null };
  try { if (el && el.textContent) msg = JSON.parse(el.textContent); } catch (e) {}
  try {
    if (window.opener) window.opener.postMessage(msg, window.location.origin);
  } catch (e) {}
  try { window.close(); } catch (e) {}
})();
</script>
</body>
</html>`;
}

/** Read a single cookie value from the request (handles `=` inside values). */
function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) !== name) continue;
    const raw = trimmed.slice(eq + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}
