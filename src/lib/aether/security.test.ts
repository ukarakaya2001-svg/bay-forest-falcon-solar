import assert from "node:assert/strict";
import { test } from "node:test";
import { highlightAether, highlightTarget, sanitizeHighlightHtml } from "./highlight.ts";
import { interpret } from "./interpreter.ts";
import { lex, LexError } from "./lexer.ts";
import { parse } from "./parser.ts";
import { isGrokEmbedderOrigin, resolveParentEmbedderOrigin } from "../preview-embedder-origin.ts";
import { isTrustedStunUrl } from "../multiplayer/p2p.ts";

function run(source: string) {
  const p = parse(source);
  if (!p.ok) return { ok: false as const, output: [] as string[], error: p.errors[0]! };
  return interpret(p.program);
}

test("highlighter never emits raw HTML tags from adversarial source", () => {
  const payloads = [
    "<img src=x onerror=\"alert(1)\">",
    "</span><img src=x onerror=alert(1)>",
    "print(\"<script>alert(1)</script>\")",
    "javascript:alert(1)",
    "\"><svg onload=alert(1)>",
    "' onfocus=alert(1) x='",
  ];
  const allowed = /<\/?span class="tok-[a-z]+">|<\/span>/g;
  for (const payload of payloads) {
    const html = highlightAether(payload);
    const leftover = html.replace(allowed, "");
    assert.doesNotMatch(leftover, /<[^>]+>/, payload);
    assert.equal(sanitizeHighlightHtml(html), html);
  }
});

test("target highlighter also escapes markup", () => {
  const html = highlightTarget("console.log(\"<img src=x onerror=alert(1)>\")", "javascript");
  assert.ok(html.includes("\u0026lt;img"));
  assert.doesNotMatch(html.replace(/<\/?span class="tok-[a-z]+">|<\/span>/g, ""), /<[^>]+>/);
});

test("highlight sanitizer strips unknown tags", () => {
  const dirty = `<span class="tok-kw">fn</span><img src=x><script>alert(1)</script><span class="tok-evil">x</span>`;
  const clean = sanitizeHighlightHtml(dirty);
  assert.doesNotMatch(clean, /<img/i);
  assert.doesNotMatch(clean, /<script/i);
  assert.doesNotMatch(clean, /tok-evil/);
  assert.match(clean, /<span class="tok-kw">fn<\/span>/);
});

test("sandbox preview does not trust an arbitrary parent origin", () => {
  assert.equal(
    resolveParentEmbedderOrigin(false, "https://evil.example", null, "guest.grok-sandbox.com"),
    null,
  );
  assert.equal(
    resolveParentEmbedderOrigin(false, "https://grok.com/app", null, "guest.grok-sandbox.com"),
    "https://grok.com",
  );
  assert.equal(isGrokEmbedderOrigin("https://attacker.com"), false);
  assert.equal(isGrokEmbedderOrigin("javascript:alert(1)"), false);
});

test("only stun and stuns URLs are accepted as ICE servers", () => {
  assert.equal(isTrustedStunUrl("stun:stun.l.google.com:19302"), true);
  assert.equal(isTrustedStunUrl("stuns:stun.example.com:443"), true);
  assert.equal(isTrustedStunUrl("turn:evil.example:3478"), false);
  assert.equal(isTrustedStunUrl("https://evil.example"), false);
  assert.equal(isTrustedStunUrl("javascript:alert(1)"), false);
  assert.equal(isTrustedStunUrl("stun:host:3478?a=1"), false);
});

test("string concatenation is size-bounded", () => {
  const r = run(`fn main() {
    let s = "a"
    for i in 0..30 {
      s = s + s
    }
    print(s)
  }`);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error.message, /String size limit/);
});

test("list concatenation is size-bounded", () => {
  const r = run(`fn main() {
    let xs = [1]
    for i in 0..20 {
      xs = xs + xs
    }
    print(len(xs))
  }`);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error.message, /List size limit/);
});

test("lexer still rejects oversized source", () => {
  assert.throws(() => lex("a".repeat(1_000_001)), (err: unknown) => err instanceof LexError);
});
