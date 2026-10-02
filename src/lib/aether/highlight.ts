import { lex } from "./lexer.ts";
import { TARGETS, type TargetId } from "./targets.ts";
import type { Token } from "./tokens.ts";

const TYPES = new Set(["int", "float", "str", "bool", "list", "map", "void"]);
const KW = new Set([
  "fn",
  "let",
  "const",
  "if",
  "else",
  "for",
  "in",
  "while",
  "return",
  "type",
  "true",
  "false",
  "null",
  "and",
  "or",
  "not",
]);

const MAX_HIGHLIGHT_CHARS = 1_000_000;
const MAX_HIGHLIGHT_RENDER_CHARS = 20_000;
const ALLOWED_SPAN = /^<span class="tok-(?:comment|str|num|kw|type|fn|ident|punct)">$/;

function esc(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026#39;");
}

/** Defense in depth: only tok-* spans may survive into dangerouslySetInnerHTML. */
export function sanitizeHighlightHtml(html: string): string {
  return html.replace(/<\/?[^>]*>/g, (tag) => {
    if (tag === "</span>") return tag;
    if (ALLOWED_SPAN.test(tag)) return tag;
    return "";
  });
}

function cls(tok: Token, next: Token | undefined): string {
  if (tok.kind === "comment") return "tok-comment";
  if (tok.kind === "string") return "tok-str";
  if (tok.kind === "number") return "tok-num";
  if (KW.has(tok.kind) || KW.has(tok.lexeme)) return "tok-kw";
  if (tok.kind === "ident" && TYPES.has(tok.lexeme)) return "tok-type";
  if (tok.kind === "ident" && next?.kind === "(") return "tok-fn";
  if (tok.kind === "ident") return "tok-ident";
  return "tok-punct";
}

function boundedSource(source: string): string {
  if (source.length <= MAX_HIGHLIGHT_CHARS) return source;
  return `${source.slice(0, MAX_HIGHLIGHT_RENDER_CHARS)}\n/* truncated */`;
}

export function highlightAether(source: string): string {
  const input = boundedSource(source);
  let tokens: Token[];
  try {
    tokens = lex(input);
  } catch {
    return sanitizeHighlightHtml(esc(input));
  }
  let html = "";
  let i = 0;
  for (let k = 0; k < tokens.length; k++) {
    const t = tokens[k]!;
    if (t.kind === "eof") break;
    if (t.pos > i) html += esc(input.slice(i, t.pos));
    const next = tokens[k + 1];
    html += `<span class="${cls(t, next)}">${esc(t.lexeme)}</span>`;
    i = t.pos + t.lexeme.length;
  }
  if (i < input.length) html += esc(input.slice(i));
  return sanitizeHighlightHtml(html);
}

const LANG_KW: Record<string, string[]> = {
  javascript: ["function", "const", "let", "var", "if", "else", "for", "while", "return", "of", "in", "true", "false", "null", "class", "new"],
  typescript: ["function", "const", "let", "var", "if", "else", "for", "while", "return", "of", "in", "true", "false", "null", "type", "interface", "number", "string", "boolean", "void"],
  python: ["def", "if", "elif", "else", "for", "while", "return", "in", "and", "or", "not", "True", "False", "None", "class", "import", "from", "as"],
  go: ["package", "import", "func", "if", "else", "for", "return", "var", "type", "struct", "range", "true", "false", "nil"],
  rust: ["fn", "let", "mut", "if", "else", "for", "in", "while", "return", "struct", "true", "false", "vec"],
  c: ["int", "long", "double", "char", "void", "if", "else", "for", "while", "return", "include", "printf"],
  cpp: ["int", "long", "double", "void", "if", "else", "for", "while", "return", "using", "namespace", "auto", "include", "string", "cout", "endl"],
  java: ["public", "static", "class", "void", "int", "double", "String", "if", "else", "for", "while", "return", "import", "new", "var", "true", "false", "null"],
  csharp: ["using", "public", "static", "class", "void", "int", "double", "string", "var", "if", "else", "for", "foreach", "while", "return", "true", "false", "null", "new"],
  ruby: ["def", "end", "if", "elsif", "else", "do", "each", "true", "false", "nil", "return", "puts"],
  swift: ["func", "let", "var", "if", "else", "for", "in", "while", "return", "struct", "true", "false", "nil", "print"],
  kotlin: ["fun", "val", "var", "if", "else", "for", "in", "until", "while", "return", "data", "class", "true", "false", "null"],
  php: ["function", "if", "elseif", "else", "for", "foreach", "while", "return", "echo", "true", "false", "null", "as"],
  dart: ["void", "int", "var", "final", "if", "else", "for", "in", "while", "return", "true", "false", "null", "print"],
  lua: ["function", "end", "if", "then", "elseif", "else", "for", "do", "while", "return", "true", "false", "nil", "local", "in", "ipairs"],
  scala: ["def", "val", "var", "if", "else", "for", "until", "while", "return", "case", "class", "true", "false", "null"],
  elixir: ["def", "do", "end", "if", "else", "fn", "true", "false", "nil"],
  haskell: ["module", "where", "main", "if", "then", "else", "do", "let", "True", "False", "data"],
};

export function highlightTarget(source: string, id: TargetId): string {
  const input = boundedSource(source);
  const kws = new Set(LANG_KW[id] ?? []);
  const comment = TARGETS.find((t) => t.id === id)?.comment ?? "//";
  let html = "";
  let i = 0;
  const n = input.length;

  const take = (end: number, clsName: string) => {
    html += `<span class="${clsName}">${esc(input.slice(i, end))}</span>`;
    i = end;
  };

  while (i < n) {
    if (input.startsWith(comment, i)) {
      let e = input.indexOf("\n", i);
      if (e < 0) e = n;
      take(e, "tok-comment");
      continue;
    }
    const c = input[i]!;
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n && input[j] !== q) {
        if (input[j] === "\\") j += 2;
        else j += 1;
      }
      take(Math.min(j + 1, n), "tok-str");
      continue;
    }
    if (c >= "0" && c <= "9") {
      let j = i;
      while (j < n && /[0-9.]/.test(input[j]!)) j += 1;
      take(j, "tok-num");
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(input[j]!)) j += 1;
      const word = input.slice(i, j);
      take(j, kws.has(word) ? "tok-kw" : "tok-ident");
      continue;
    }
    html += esc(c);
    i += 1;
  }
  return sanitizeHighlightHtml(html);
}
