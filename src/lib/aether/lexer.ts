import type { Token, TokKind } from "./tokens.ts";

export type { Token, TokKind } from "./tokens.ts";

const KEYWORDS: Record<string, TokKind> = {
  fn: "fn",
  let: "let",
  const: "const",
  if: "if",
  else: "else",
  for: "for",
  in: "in",
  while: "while",
  return: "return",
  type: "type",
  true: "true",
  false: "false",
  null: "null",
  and: "and",
  or: "or",
  not: "not",
};

const MAX_SOURCE_LENGTH = 1_000_000;

export function lex(source: string): Token[] {
  if (source.length > MAX_SOURCE_LENGTH) {
    throw new LexError(`Source exceeds the ${MAX_SOURCE_LENGTH}-character limit`, 1, 1);
  }
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let col = 1;
  const n = source.length;

  const push = (kind: TokKind, lexeme: string, pos: number, l: number, c: number) => {
    tokens.push({ kind, lexeme, pos, line: l, col: c });
  };

  while (i < n) {
    const c = source[i]!;

    if (c === " " || c === "\t" || c === "\r") {
      i += 1;
      col += 1;
      continue;
    }
    if (c === "\n") {
      i += 1;
      line += 1;
      col = 1;
      continue;
    }

    if (c === "#" || (c === "/" && source[i + 1] === "/")) {
      const start = i;
      const sl = line;
      const sc = col;
      if (c === "/") {
        i += 2;
        col += 2;
      } else {
        i += 1;
        col += 1;
      }
      while (i < n && source[i] !== "\n") {
        i += 1;
        col += 1;
      }
      push("comment", source.slice(start, i), start, sl, sc);
      continue;
    }

    if (c === '"') {
      const start = i;
      const sl = line;
      const sc = col;
      i += 1;
      col += 1;
      let out = "";
      while (i < n && source[i] !== '"') {
        if (source[i] === "\n") {
          throw lexError("Unterminated string", sl, sc);
        }
        if (source[i] === "\\") {
          const nch = source[i + 1];
          const map: Record<string, string> = {
            n: "\n",
            t: "\t",
            r: "\r",
            '"': '"',
            "\\": "\\",
          };
          if (!nch || map[nch] === undefined) {
            throw lexError("Invalid escape", line, col);
          }
          out += map[nch];
          i += 2;
          col += 2;
          continue;
        }
        out += source[i];
        i += 1;
        col += 1;
      }
      if (i >= n) throw lexError("Unterminated string", sl, sc);
      i += 1;
      col += 1;
      tokens.push({
        kind: "string",
        lexeme: source.slice(start, i),
        value: out,
        pos: start,
        line: sl,
        col: sc,
      });
      continue;
    }

    if (isDigit(c) || (c === "." && isDigit(source[i + 1] ?? ""))) {
      const start = i;
      const sl = line;
      const sc = col;
      let sawDot = false;
      if (c === ".") {
        sawDot = true;
        i += 1;
        col += 1;
      }
      while (i < n && isDigit(source[i]!)) {
        i += 1;
        col += 1;
      }
      if (!sawDot && source[i] === "." && source[i + 1] !== "." && isDigit(source[i + 1] ?? "")) {
        sawDot = true;
        i += 1;
        col += 1;
        while (i < n && isDigit(source[i]!)) {
          i += 1;
          col += 1;
        }
      }
      const lexeme = source.slice(start, i);
      tokens.push({
        kind: "number",
        lexeme,
        value: Number(lexeme),
        pos: start,
        line: sl,
        col: sc,
      });
      continue;
    }

    if (isIdentStart(c)) {
      const start = i;
      const sl = line;
      const sc = col;
      i += 1;
      col += 1;
      while (i < n && isIdentPart(source[i]!)) {
        i += 1;
        col += 1;
      }
      const lexeme = source.slice(start, i);
      const kw = KEYWORDS[lexeme];
      push(kw ?? "ident", lexeme, start, sl, sc);
      continue;
    }

    const start = i;
    const sl = line;
    const sc = col;
    const two = source.slice(i, i + 2);
    const twoKind = TWO[two];
    if (twoKind) {
      push(twoKind, two, start, sl, sc);
      i += 2;
      col += 2;
      continue;
    }
    const oneKind = ONE[c];
    if (oneKind) {
      push(oneKind, c, start, sl, sc);
      i += 1;
      col += 1;
      continue;
    }

    throw lexError(`Unexpected character ${JSON.stringify(c)}`, sl, sc);
  }

  push("eof", "", i, line, col);
  return tokens;
}

const TWO: Record<string, TokKind> = {
  "->": "->",
  "..": "..",
  "==": "==",
  "!=": "!=",
  "<=": "<=",
  ">=": ">=",
};

const ONE: Record<string, TokKind> = {
  "(": "(",
  ")": ")",
  "{": "{",
  "}": "}",
  "[": "[",
  "]": "]",
  ",": ",",
  ":": ":",
  ".": ".",
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  "%": "%",
  "=": "=",
  "<": "<",
  ">": ">",
  ";": ";",
};

function isDigit(c: string) {
  return c >= "0" && c <= "9";
}
function isIdentStart(c: string) {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || c === "_";
}
function isIdentPart(c: string) {
  return isIdentStart(c) || isDigit(c);
}

export class LexError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(message);
    this.line = line;
    this.col = col;
  }
}

function lexError(message: string, line: number, col: number) {
  return new LexError(message, line, col);
}
