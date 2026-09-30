import type {
  CompileError,
  Expr,
  FnDecl,
  Param,
  Program,
  Stmt,
  Top,
  TypeDecl,
} from "./ast.ts";
import { lex, LexError } from "./lexer.ts";
import type { Token, TokKind } from "./tokens.ts";

export class ParseError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(message);
    this.line = line;
    this.col = col;
  }
}

export type ParseResult =
  | { ok: true; program: Program; errors: CompileError[] }
  | { ok: false; program: null; errors: CompileError[] };

export function parse(source: string): ParseResult {
  try {
    const tokens = lex(source).filter((t) => t.kind !== "comment");
    const p = new Parser(tokens);
    const program = p.parseProgram();
    return { ok: true, program, errors: [] };
  } catch (e) {
    if (e instanceof ParseError || e instanceof LexError) {
      return {
        ok: false,
        program: null,
        errors: [{ message: e.message, line: e.line, col: e.col }],
      };
    }
    throw e;
  }
}

class Parser {
  private i = 0;
  private tokens: Token[];
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parseProgram(): Program {
    const body: Top[] = [];
    const loc = this.loc();
    while (!this.check("eof")) {
      body.push(this.parseTop());
    }
    return { kind: "program", body, loc };
  }

  private parseTop(): Top {
    if (this.check("fn")) return this.parseFn();
    if (this.check("type")) return this.parseTypeDecl();
    return this.parseStmt();
  }

  private parseFn(): FnDecl {
    const loc = this.loc();
    this.eat("fn");
    const name = this.eat("ident").lexeme;
    this.eat("(");
    const params: Param[] = [];
    if (!this.check(")")) {
      params.push(this.parseParam());
      while (this.match(",")) params.push(this.parseParam());
    }
    this.eat(")");
    let ret: string | null = null;
    if (this.match("->")) ret = this.parseTypeName();
    const body = this.parseBlock();
    return { kind: "fn", name, params, ret, body, loc };
  }

  private parseTypeDecl(): TypeDecl {
    const loc = this.loc();
    this.eat("type");
    const name = this.eat("ident").lexeme;
    this.eat("{");
    const fields: Param[] = [];
    while (!this.check("}") && !this.check("eof")) {
      fields.push(this.parseParam());
      this.match(";");
      this.match(",");
    }
    this.eat("}");
    return { kind: "type", name, fields, loc };
  }

  private parseParam(): Param {
    const name = this.eat("ident").lexeme;
    let type: string | null = null;
    if (this.match(":")) type = this.parseTypeName();
    return { name, type };
  }

  private parseTypeName(): string {
    if (this.check("ident")) return this.eat("ident").lexeme;
    throw this.err("Expected a type name");
  }

  private parseStmt(): Stmt {
    if (this.check("let") || this.check("const")) return this.parseLet();
    if (this.check("if")) return this.parseIf();
    if (this.check("for")) return this.parseFor();
    if (this.check("while")) return this.parseWhile();
    if (this.check("return")) {
      const loc = this.loc();
      this.eat("return");
      if (this.check("}") || this.check("eof") || this.check(";")) {
        this.match(";");
        return { kind: "return", value: null, loc };
      }
      const value = this.parseExpr();
      this.match(";");
      return { kind: "return", value, loc };
    }

    const loc = this.loc();
    const expr = this.parseExpr();
    if (this.match("=")) {
      const value = this.parseExpr();
      this.match(";");
      return { kind: "assign", target: expr, value, loc };
    }
    this.match(";");
    return { kind: "expr", expr, loc };
  }

  private parseLet(): Stmt {
    const loc = this.loc();
    const isConst = this.check("const");
    this.advance();
    const name = this.eat("ident").lexeme;
    let type: string | null = null;
    if (this.match(":")) type = this.parseTypeName();
    this.eat("=");
    const value = this.parseExpr();
    this.match(";");
    return { kind: "let", name, type, value, isConst, loc };
  }

  private parseIf(): Stmt {
    const loc = this.loc();
    this.eat("if");
    const cond = this.parseExpr();
    const then = this.parseBlock();
    const elseIfs: { cond: Expr; body: Stmt[]; loc: typeof loc }[] = [];
    let els: Stmt[] | null = null;
    while (this.match("else")) {
      if (this.match("if")) {
        const eloc = this.prev().line
          ? { line: this.prev().line, col: this.prev().col }
          : this.loc();
        const c = this.parseExpr();
        const body = this.parseBlock();
        elseIfs.push({ cond: c, body, loc: eloc });
      } else {
        els = this.parseBlock();
        break;
      }
    }
    return { kind: "if", cond, then, elseIfs, else: els, loc };
  }

  private parseFor(): Stmt {
    const loc = this.loc();
    this.eat("for");
    const name = this.eat("ident").lexeme;
    this.eat("in");
    const iter = this.parseExpr();
    const body = this.parseBlock();
    return { kind: "for", name, iter, body, loc };
  }

  private parseWhile(): Stmt {
    const loc = this.loc();
    this.eat("while");
    const cond = this.parseExpr();
    const body = this.parseBlock();
    return { kind: "while", cond, body, loc };
  }

  private parseBlock(): Stmt[] {
    this.eat("{");
    const body: Stmt[] = [];
    while (!this.check("}") && !this.check("eof")) {
      if (this.check("fn") || this.check("type")) {
        throw this.err("Nested functions and types are not allowed");
      }
      body.push(this.parseStmt());
    }
    this.eat("}");
    return body;
  }

  private parseExpr(): Expr {
    return this.parseRange();
  }

  private parseRange(): Expr {
    const left = this.parseOr();
    if (this.match("..")) {
      const loc = this.prevLoc();
      const right = this.parseOr();
      return { kind: "range", start: left, end: right, loc };
    }
    return left;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.match("or")) {
      const loc = this.prevLoc();
      const right = this.parseAnd();
      left = { kind: "binary", op: "or", left, right, loc };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.match("and")) {
      const loc = this.prevLoc();
      const right = this.parseNot();
      left = { kind: "binary", op: "and", left, right, loc };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.match("not")) {
      const loc = this.prevLoc();
      return { kind: "unary", op: "not", expr: this.parseNot(), loc };
    }
    return this.parseCmp();
  }

  private parseCmp(): Expr {
    let left = this.parseTerm();
    while (this.matchAny("==", "!=", "<", ">", "<=", ">=")) {
      const op = this.prev().lexeme;
      const loc = this.prevLoc();
      const right = this.parseTerm();
      left = { kind: "binary", op, left, right, loc };
    }
    return left;
  }

  private parseTerm(): Expr {
    let left = this.parseFactor();
    while (this.matchAny("+", "-")) {
      const op = this.prev().lexeme;
      const loc = this.prevLoc();
      const right = this.parseFactor();
      left = { kind: "binary", op, left, right, loc };
    }
    return left;
  }

  private parseFactor(): Expr {
    let left = this.parseUnary();
    while (this.matchAny("*", "/", "%")) {
      const op = this.prev().lexeme;
      const loc = this.prevLoc();
      const right = this.parseUnary();
      left = { kind: "binary", op, left, right, loc };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.match("-")) {
      const loc = this.prevLoc();
      return { kind: "unary", op: "-", expr: this.parseUnary(), loc };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expr {
    let expr = this.parsePrimary();
    for (;;) {
      if (this.match("(")) {
        const loc = this.prevLoc();
        const args: Expr[] = [];
        if (!this.check(")")) {
          args.push(this.parseExpr());
          while (this.match(",")) args.push(this.parseExpr());
        }
        this.eat(")");
        expr = { kind: "call", callee: expr, args, loc };
        continue;
      }
      if (this.match("[")) {
        const loc = this.prevLoc();
        const index = this.parseExpr();
        this.eat("]");
        expr = { kind: "index", obj: expr, index, loc };
        continue;
      }
      if (this.match(".")) {
        const loc = this.prevLoc();
        const name = this.eat("ident").lexeme;
        expr = { kind: "member", obj: expr, name, loc };
        continue;
      }
      break;
    }
    return expr;
  }

  private parsePrimary(): Expr {
    const loc = this.loc();
    if (this.match("number")) {
      const t = this.prev();
      const raw = t.lexeme.includes(".") ? "float" : "int";
      return { kind: "literal", value: t.value as number, raw, loc };
    }
    if (this.match("string")) {
      return { kind: "literal", value: this.prev().value as string, raw: "str", loc };
    }
    if (this.match("true")) return { kind: "literal", value: true, raw: "bool", loc };
    if (this.match("false")) return { kind: "literal", value: false, raw: "bool", loc };
    if (this.match("null")) return { kind: "literal", value: null, raw: "null", loc };

    if (this.match("ident")) {
      const name = this.prev().lexeme;
      if (this.check("{") && this.looksLikeStruct()) {
        this.eat("{");
        const entries = this.parseEntries();
        this.eat("}");
        return { kind: "struct", name, entries, loc };
      }
      return { kind: "ident", name, loc };
    }

    if (this.match("[")) {
      const items: Expr[] = [];
      if (!this.check("]")) {
        items.push(this.parseExpr());
        while (this.match(",")) {
          if (this.check("]")) break;
          items.push(this.parseExpr());
        }
      }
      this.eat("]");
      return { kind: "list", items, loc };
    }

    if (this.match("{")) {
      const entries = this.parseEntries();
      this.eat("}");
      return { kind: "map", entries, loc };
    }

    if (this.match("(")) {
      const expr = this.parseExpr();
      this.eat(")");
      return expr;
    }

    throw this.err("Expected an expression");
  }

  private looksLikeStruct(): boolean {
    const a = this.peek(1);
    const b = this.peek(2);
    if (!a) return false;
    if (a.kind === "}") return true;
    return a.kind === "ident" && b?.kind === ":";
  }

  private parseEntries(): { key: string; value: Expr }[] {
    const entries: { key: string; value: Expr }[] = [];
    while (!this.check("}") && !this.check("eof")) {
      const key = this.check("ident")
        ? this.eat("ident").lexeme
        : this.check("string")
          ? String(this.eat("string").value)
          : (() => {
              throw this.err("Expected a field name");
            })();
      this.eat(":");
      const value = this.parseExpr();
      entries.push({ key, value });
      this.match(",");
    }
    return entries;
  }

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.i + offset];
  }
  private check(kind: TokKind): boolean {
    return this.peek()?.kind === kind;
  }
  private match(kind: TokKind): boolean {
    if (this.check(kind)) {
      this.advance();
      return true;
    }
    return false;
  }
  private matchAny(...kinds: TokKind[]): boolean {
    for (const k of kinds) if (this.match(k)) return true;
    return false;
  }
  private advance(): Token {
    const t = this.tokens[this.i];
    if (!t) throw this.err("Unexpected end of file");
    if (t.kind !== "eof") this.i += 1;
    return t;
  }
  private prev(): Token {
    return this.tokens[this.i - 1]!;
  }
  private prevLoc() {
    const t = this.prev();
    return { line: t.line, col: t.col };
  }
  private loc() {
    const t = this.peek() ?? this.prev();
    return { line: t.line, col: t.col };
  }
  private eat(kind: TokKind): Token {
    if (this.check(kind)) return this.advance();
    const t = this.peek();
    throw this.err(`Expected ${kind}, got ${t?.kind ?? "eof"}`);
  }
  private err(message: string) {
    const t = this.peek();
    return new ParseError(message, t?.line ?? 1, t?.col ?? 1);
  }
}
