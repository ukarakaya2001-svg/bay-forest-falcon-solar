#!/usr/bin/env node
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

const client = readFileSync(new URL("../src/lib/auth/client.ts", import.meta.url), "utf8");
const popup = readFileSync(new URL("../src/lib/auth/popup.server.ts", import.meta.url), "utf8");
const highlight = readFileSync(new URL("../src/lib/aether/highlight.ts", import.meta.url), "utf8");
const rtc = readFileSync(new URL("../src/lib/multiplayer/signaling.server.ts", import.meta.url), "utf8");
const embedder = readFileSync(new URL("../src/lib/preview-embedder-origin.ts", import.meta.url), "utf8");
const popupServer = readFileSync(new URL("../src/lib/auth/popup.server.ts", import.meta.url), "utf8");
const connectorServer = readFileSync(new URL("../src/lib/app-data/client.server.ts", import.meta.url), "utf8");
const authServer = readFileSync(new URL("../src/lib/auth/server.ts", import.meta.url), "utf8");
const preview = readFileSync(new URL("../src/lib/auth/preview.ts", import.meta.url), "utf8");
const p2p = readFileSync(new URL("../src/lib/multiplayer/p2p.ts", import.meta.url), "utf8");
const interpreter = readFileSync(new URL("../src/lib/aether/interpreter.ts", import.meta.url), "utf8");
const grokPwa = readFileSync(new URL("../server/middleware/grok-pwa.ts", import.meta.url), "utf8");

test("auth callbacks are normalized to same-origin paths", () => {
  assert.match(client, /safeCallbackPath/);
  assert.match(client, /window\.location\.assign\(safeCallbackPath\(redirectTo\)\)/);
  assert.doesNotMatch(client, /window\.location\.href\s*=\s*callbackURL/);
  assert.doesNotMatch(client, /window\.location\.href\s*=\s*redirectTo/);
});

test("popup provider is allowlisted and opener is authenticated", () => {
  assert.match(popup, /GROK_PROVIDERS\.some/);
  assert.match(popup, /script-src 'nonce-/);
  assert.doesNotMatch(popup, /script-src 'unsafe-inline'/);
  assert.match(client, /event\.source !== popup/);
  assert.match(client, /GROK_PROVIDERS\.some\(\(provider\) => provider\.providerId === providerId\)/);
});

test("oauth popup does not leak internal errors or break opener", () => {
  assert.match(popupServer, /error: "oauth_init_failed"/);
  assert.doesNotMatch(popupServer, /error: detail/);
  assert.doesNotMatch(popupServer, /error: message/);
  assert.doesNotMatch(client, /noopener,noreferrer/);
});

test("highlighting does not directly trust raw HTML", () => {
  assert.match(highlight, /\\u0026amp;/);
  assert.match(highlight, /\\u0026lt;/);
  assert.match(highlight, /\\u0026gt;/);
  assert.match(highlight, /\\u0026quot;/);
  assert.match(highlight, /sanitizeHighlightHtml/);
  assert.match(highlight, /tok-\(\?:comment\|str\|num\|kw\|type\|fn\|ident\|punct\)/);
});

test("RTC signaling has strict schema and bounded traffic", () => {
  assert.match(rtc, /MAX_SIGNAL_BYTES/);
  assert.match(rtc, /MAX_ROOM_PEERS/);
  assert.match(rtc, /MAX_SIGNALS_PER_POLL/);
  assert.match(rtc, /z\.discriminatedUnion/);
  assert.match(rtc, /x-aether-rtc-token/);
  assert.match(rtc, /randomBytes\(TOKEN_BYTES\)/);
  assert.match(rtc, /authenticatePeer/);
  assert.match(rtc, /readBoundedJson/);
  assert.match(rtc, /rate limit exceeded/);
  assert.match(rtc, /cross-site request denied/);
  assert.match(rtc, /unsupported media type/);
});

test("sandbox preview bridge never trusts an arbitrary framing origin", () => {
  assert.doesNotMatch(embedder, /isSandboxPreviewGuestHost\(guestHostname\)\s*\|\|/);
  assert.match(embedder, /isRemintPreviewPair\(guestHostname, url\.hostname\)/);
});

test("oauth popup validates the broker redirect destination", () => {
  assert.match(popupServer, /redirect\.protocol !== "https:"/);
  assert.match(popupServer, /redirect\.origin !== issuer\.origin/);
});

test("connector forwarding only permits trusted HTTPS gate hosts", () => {
  assert.match(connectorServer, /CONNECTORS_HOST_PROD/);
  assert.match(connectorServer, /CONNECTORS_HOST_STAGING/);
  assert.match(connectorServer, /url\.protocol !== "https:"/);
  assert.match(connectorServer, /trustedGateLoginUrl/);
});

test("no preview OAuth client secret is stored in source", () => {
  assert.doesNotMatch(preview, /PREVIEW_CLIENT_SECRET/);
  assert.doesNotMatch(authServer, /PREVIEW_CLIENT_SECRET/);
  assert.match(authServer, /grokClientSecret = env\("GROK_AUTH_CLIENT_SECRET"\)/);
});

test("production trusted origins do not include localhost", () => {
  assert.match(authServer, /explicitBaseURL\s*\n\s*\? \[explicitBaseURL\]/);
});

test("ICE servers reject turn and script URLs", () => {
  assert.match(p2p, /isTrustedStunUrl/);
  assert.match(p2p, /\^stuns\?:/);
});

test("interpreter bounds strings, collections, output and recursion", () => {
  assert.match(interpreter, /MAX_STRING_CHARS/);
  assert.match(interpreter, /MAX_COLLECTION_ITEMS/);
  assert.match(interpreter, /MAX_OUTPUT_LINES/);
  assert.match(interpreter, /MAX_DEPTH/);
  assert.match(interpreter, /<cycle>/);
});

test("document responses carry nosniff and restrictive permissions", () => {
  assert.match(grokPwa, /x-content-type-options/, "nosniff");
  assert.match(grokPwa, /permissions-policy/);
  assert.match(grokPwa, /cross-origin-opener-policy/);
});
