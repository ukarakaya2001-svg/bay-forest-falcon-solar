import type { Expr, FnDecl, Program, Stmt, TypeDecl } from "./ast.ts";

export type RunResult =
  | { ok: true; output: string[]; value: string | null; error: null }
  | { ok: false; output: string[]; value: null; error: { message: string; line: number; col: number } };

type Value =
  | { t: "int"; v: number }
  | { t: "float"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "null" }
  | { t: "list"; v: Value[] }
  | { t: "map"; v: Map<string, Value> }
  | { t: "fn"; name: string; decl: FnDecl }
  | { t: "native"; name: string; impl: (...args: Value[]) => Value };

class RuntimeError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(message);
    this.line = line;
    this.col = col;
  }
}

class ReturnSignal {
  value: Value;
  constructor(value: Value) {
    this.value = value;
  }
}

class Env {
  parent: Env | null;
  values: Map<string, { value: Value; mut: boolean }>;
  constructor(
    parent: Env | null = null,
    values: Map<string, { value: Value; mut: boolean }> = new Map(),
  ) {
    this.parent = parent;
    this.values = values;
  }

  declare(name: string, value: Value, mut: boolean, line: number, col: number) {
    if (this.values.has(name)) {
      throw new RuntimeError(`'${name}' is already defined in this scope`, line, col);
    }
    this.values.set(name, { value, mut });
  }

  set(name: string, value: Value, line: number, col: number) {
    let e: Env | null = this;
    while (e) {
      const slot = e.values.get(name);
      if (slot) {
        if (!slot.mut) throw new RuntimeError(`Cannot assign to const '${name}'`, line, col);
        slot.value = value;
        return;
      }
      e = e.parent;
    }
    throw new RuntimeError(`Unknown name '${name}'`, line, col);
  }

  get(name: string, line: number, col: number): Value {
    let e: Env | null = this;
    while (e) {
      const slot = e.values.get(name);
      if (slot) return slot.value;
      e = e.parent;
    }
    throw new RuntimeError(`Unknown name '${name}'`, line, col);
  }
}

const MAX_STEPS = 250_000;
const MAX_DEPTH = 400;

export function interpret(program: Program): RunResult {
  const output: string[] = [];
  let steps = 0;
  let depth = 0;

  const tick = (line: number, col: number) => {
    steps += 1;
    if (steps > MAX_STEPS) {
      throw new RuntimeError("Execution limit reached (infinite loop?)", line, col);
    }
  };

  const display = (v: Value): string => {
    switch (v.t) {
      case "int":
        return String(v.v);
      case "float": {
        const s = String(v.v);
        return s.includes(".") ? s : `${s}.0`;
      }
      case "str":
        return v.v;
      case "bool":
        return v.v ? "true" : "false";
      case "null":
        return "null";
      case "list":
        return `[${v.v.map(display).join(", ")}]`;
      case "map": {
        const parts: string[] = [];
        v.v.forEach((val, key) => parts.push(`${key}: ${display(val)}`));
        return `{ ${parts.join(", ")} }`;
      }
      case "fn":
        return `<fn ${v.name}>`;
      case "native":
        return `<fn ${v.name}>`;
    }
  };

  const truthy = (v: Value) => {
    if (v.t === "bool") return v.v;
    if (v.t === "null") return false;
    if (v.t === "int" || v.t === "float") return v.v !== 0;
    if (v.t === "str") return v.v.length > 0;
    if (v.t === "list") return v.v.length > 0;
    return true;
  };

  const num = (v: Value, line: number, col: number): { t: "int" | "float"; v: number } => {
    if (v.t === "int" || v.t === "float") return v;
    throw new RuntimeError("Expected a number", line, col);
  };

  const eq = (a: Value, b: Value): boolean => {
    if (a.t === "null" || b.t === "null") return a.t === "null" && b.t === "null";
    if ((a.t === "int" || a.t === "float") && (b.t === "int" || b.t === "float")) return a.v === b.v;
    if (a.t !== b.t) return false;
    if (a.t === "str" && b.t === "str") return a.v === b.v;
    if (a.t === "bool" && b.t === "bool") return a.v === b.v;
    if (a.t === "list" && b.t === "list") {
      if (a.v.length !== b.v.length) return false;
      return a.v.every((x, i) => eq(x, b.v[i]!));
    }
    if (a.t === "map" && b.t === "map") {
      if (a.v.size !== b.v.size) return false;
      for (const [k, v] of a.v) {
        const o = b.v.get(k);
        if (!o || !eq(v, o)) return false;
      }
      return true;
    }
    return false;
  };

  const env = new Env();

  const native = (name: string, impl: (...args: Value[]) => Value) => {
    env.declare(name, { t: "native", name, impl }, false, 1, 1);
  };

  native("print", (...args) => {
    output.push(args.map(display).join(" "));
    return { t: "null" };
  });
  native("str", (v) => {
    if (!v) return { t: "str", v: "null" };
    return { t: "str", v: display(v) };
  });
  native("len", (v) => {
    if (!v) throw new RuntimeError("len() expected a value", 1, 1);
    if (v.t === "str") return { t: "int", v: v.v.length };
    if (v.t === "list") return { t: "int", v: v.v.length };
    if (v.t === "map") return { t: "int", v: v.v.size };
    throw new RuntimeError("len() expected a list, map, or string", 1, 1);
  });
  native("int", (v) => {
    if (!v) return { t: "int", v: 0 };
    if (v.t === "int") return v;
    if (v.t === "float") return { t: "int", v: Math.trunc(v.v) };
    if (v.t === "str") {
      const n = Number.parseInt(v.v, 10);
      if (Number.isNaN(n)) throw new RuntimeError(`Cannot convert '${v.v}' to int`, 1, 1);
      return { t: "int", v: n };
    }
    if (v.t === "bool") return { t: "int", v: v.v ? 1 : 0 };
    throw new RuntimeError("Cannot convert to int", 1, 1);
  });
  native("float", (v) => {
    if (!v) return { t: "float", v: 0 };
    if (v.t === "float") return v;
    if (v.t === "int") return { t: "float", v: v.v };
    if (v.t === "str") {
      const n = Number.parseFloat(v.v);
      if (Number.isNaN(n)) throw new RuntimeError(`Cannot convert '${v.v}' to float`, 1, 1);
      return { t: "float", v: n };
    }
    throw new RuntimeError("Cannot convert to float", 1, 1);
  });

  const types = new Map<string, TypeDecl>();

  const evalExpr = (expr: Expr, e: Env): Value => {
    tick(expr.loc.line, expr.loc.col);
    switch (expr.kind) {
      case "literal": {
        if (expr.raw === "int") return { t: "int", v: expr.value as number };
        if (expr.raw === "float") return { t: "float", v: expr.value as number };
        if (expr.raw === "str") return { t: "str", v: expr.value as string };
        if (expr.raw === "bool") return { t: "bool", v: expr.value as boolean };
        return { t: "null" };
      }
      case "ident":
        return e.get(expr.name, expr.loc.line, expr.loc.col);
      case "list":
        return { t: "list", v: expr.items.map((x) => evalExpr(x, e)) };
      case "map": {
        const m = new Map<string, Value>();
        for (const ent of expr.entries) m.set(ent.key, evalExpr(ent.value, e));
        return { t: "map", v: m };
      }
      case "struct": {
        const m = new Map<string, Value>();
        m.set("__type", { t: "str", v: expr.name });
        for (const ent of expr.entries) m.set(ent.key, evalExpr(ent.value, e));
        return { t: "map", v: m };
      }
      case "range": {
        const a = num(evalExpr(expr.start, e), expr.loc.line, expr.loc.col);
        const b = num(evalExpr(expr.end, e), expr.loc.line, expr.loc.col);
        const start = Math.trunc(a.v);
        const end = Math.trunc(b.v);
        const items: Value[] = [];
        if (end >= start) {
          for (let i = start; i < end; i++) items.push({ t: "int", v: i });
        } else {
          for (let i = start; i > end; i--) items.push({ t: "int", v: i });
        }
        return { t: "list", v: items };
      }
      case "unary": {
        const v = evalExpr(expr.expr, e);
        if (expr.op === "not") return { t: "bool", v: !truthy(v) };
        const n = num(v, expr.loc.line, expr.loc.col);
        return { t: n.t, v: -n.v };
      }
      case "binary":
        return evalBinary(expr.op, evalExpr(expr.left, e), evalExpr(expr.right, e), expr.loc.line, expr.loc.col);
      case "call":
        return evalCall(expr, e);
      case "index": {
        const obj = evalExpr(expr.obj, e);
        const idx = evalExpr(expr.index, e);
        if (obj.t === "list") {
          const i = num(idx, expr.loc.line, expr.loc.col);
          const k = Math.trunc(i.v);
          if (k < 0 || k >= obj.v.length) {
            throw new RuntimeError("List index out of range", expr.loc.line, expr.loc.col);
          }
          return obj.v[k]!;
        }
        if (obj.t === "map") {
          const key = idx.t === "str" ? idx.v : display(idx);
          const found = obj.v.get(key);
          if (!found) throw new RuntimeError(`Missing key '${key}'`, expr.loc.line, expr.loc.col);
          return found;
        }
        if (obj.t === "str") {
          const i = num(idx, expr.loc.line, expr.loc.col);
          const k = Math.trunc(i.v);
          if (k < 0 || k >= obj.v.length) {
            throw new RuntimeError("String index out of range", expr.loc.line, expr.loc.col);
          }
          return { t: "str", v: obj.v[k]! };
        }
        throw new RuntimeError("Cannot index this value", expr.loc.line, expr.loc.col);
      }
      case "member": {
        const obj = evalExpr(expr.obj, e);
        if (obj.t !== "map") throw new RuntimeError("Cannot read a field on this value", expr.loc.line, expr.loc.col);
        const found = obj.v.get(expr.name);
        if (!found) throw new RuntimeError(`Unknown field '${expr.name}'`, expr.loc.line, expr.loc.col);
        return found;
      }
    }
  };

  const evalBinary = (op: string, left: Value, right: Value, line: number, col: number): Value => {
    switch (op) {
      case "or":
        return { t: "bool", v: truthy(left) || truthy(right) };
      case "and":
        return { t: "bool", v: truthy(left) && truthy(right) };
      case "==":
        return { t: "bool", v: eq(left, right) };
      case "!=":
        return { t: "bool", v: !eq(left, right) };
      case "<":
      case ">":
      case "<=":
      case ">=": {
        if ((left.t === "int" || left.t === "float") && (right.t === "int" || right.t === "float")) {
          const cmp =
            op === "<" ? left.v < right.v : op === ">" ? left.v > right.v : op === "<=" ? left.v <= right.v : left.v >= right.v;
          return { t: "bool", v: cmp };
        }
        if (left.t === "str" && right.t === "str") {
          const cmp =
            op === "<" ? left.v < right.v : op === ">" ? left.v > right.v : op === "<=" ? left.v <= right.v : left.v >= right.v;
          return { t: "bool", v: cmp };
        }
        throw new RuntimeError("Cannot compare these values", line, col);
      }
      case "+": {
        if (left.t === "str" || right.t === "str") {
          return { t: "str", v: display(left) + display(right) };
        }
        if ((left.t === "int" || left.t === "float") && (right.t === "int" || right.t === "float")) {
          const v = left.v + right.v;
          return left.t === "float" || right.t === "float" ? { t: "float", v } : { t: "int", v };
        }
        if (left.t === "list" && right.t === "list") return { t: "list", v: [...left.v, ...right.v] };
        throw new RuntimeError("Cannot add these values", line, col);
      }
      case "-":
      case "*":
      case "/":
      case "%": {
        const a = num(left, line, col);
        const b = num(right, line, col);
        if ((op === "/" || op === "%") && b.v === 0) throw new RuntimeError("Division by zero", line, col);
        if (op === "/" && a.t === "int" && b.t === "int") {
          return { t: "int", v: Math.trunc(a.v / b.v) };
        }
        const v = op === "-" ? a.v - b.v : op === "*" ? a.v * b.v : op === "/" ? a.v / b.v : a.v % b.v;
        if (op === "/") return { t: "float", v };
        return a.t === "float" || b.t === "float" ? { t: "float", v } : { t: "int", v };
      }
      default:
        throw new RuntimeError(`Unknown operator ${op}`, line, col);
    }
  };

  const evalCall = (expr: Extract<Expr, { kind: "call" }>, e: Env): Value => {
    const callee = evalExpr(expr.callee, e);
    const args = expr.args.map((a) => evalExpr(a, e));
    if (callee.t === "native") {
      try {
        return callee.impl(...args);
      } catch (err) {
        if (err instanceof RuntimeError) {
          throw new RuntimeError(err.message, expr.loc.line, expr.loc.col);
        }
        throw err;
      }
    }
    if (callee.t !== "fn") throw new RuntimeError("Not a function", expr.loc.line, expr.loc.col);
    if (args.length !== callee.decl.params.length) {
      throw new RuntimeError(
        `'${callee.name}' expected ${callee.decl.params.length} argument(s), got ${args.length}`,
        expr.loc.line,
        expr.loc.col,
      );
    }
    if (depth >= MAX_DEPTH) {
      throw new RuntimeError("Maximum recursion depth exceeded", expr.loc.line, expr.loc.col);
    }
    depth += 1;
    const local = new Env(env);
    callee.decl.params.forEach((p, i) => {
      local.declare(p.name, args[i]!, true, expr.loc.line, expr.loc.col);
    });
    try {
      execBlock(callee.decl.body, local);
      depth -= 1;
      return { t: "null" };
    } catch (err) {
      depth -= 1;
      if (err instanceof ReturnSignal) return err.value;
      throw err;
    }
  };

  const assignTarget = (target: Expr, value: Value, e: Env) => {
    if (target.kind === "ident") {
      e.set(target.name, value, target.loc.line, target.loc.col);
      return;
    }
    if (target.kind === "index") {
      const obj = evalExpr(target.obj, e);
      const idx = evalExpr(target.index, e);
      if (obj.t === "list") {
        const i = Math.trunc(num(idx, target.loc.line, target.loc.col).v);
        if (i < 0 || i >= obj.v.length) throw new RuntimeError("List index out of range", target.loc.line, target.loc.col);
        obj.v[i] = value;
        return;
      }
      if (obj.t === "map") {
        const key = idx.t === "str" ? idx.v : display(idx);
        obj.v.set(key, value);
        return;
      }
    }
    if (target.kind === "member") {
      const obj = evalExpr(target.obj, e);
      if (obj.t !== "map") throw new RuntimeError("Cannot assign a field on this value", target.loc.line, target.loc.col);
      obj.v.set(target.name, value);
      return;
    }
    throw new RuntimeError("Invalid assignment target", target.loc.line, target.loc.col);
  };

  const execStmt = (stmt: Stmt, e: Env) => {
    tick(stmt.loc.line, stmt.loc.col);
    switch (stmt.kind) {
      case "let": {
        const v = evalExpr(stmt.value, e);
        e.declare(stmt.name, v, !stmt.isConst, stmt.loc.line, stmt.loc.col);
        return;
      }
      case "assign":
        assignTarget(stmt.target, evalExpr(stmt.value, e), e);
        return;
      case "expr":
        evalExpr(stmt.expr, e);
        return;
      case "return":
        throw new ReturnSignal(stmt.value ? evalExpr(stmt.value, e) : { t: "null" });
      case "if": {
        if (truthy(evalExpr(stmt.cond, e))) {
          execBlock(stmt.then, new Env(e));
          return;
        }
        for (const branch of stmt.elseIfs) {
          if (truthy(evalExpr(branch.cond, e))) {
            execBlock(branch.body, new Env(e));
            return;
          }
        }
        if (stmt.else) execBlock(stmt.else, new Env(e));
        return;
      }
      case "for": {
        const iter = evalExpr(stmt.iter, e);
        if (iter.t !== "list") throw new RuntimeError("'for' expected a list or range", stmt.loc.line, stmt.loc.col);
        for (const item of iter.v) {
          const local = new Env(e);
          local.declare(stmt.name, item, true, stmt.loc.line, stmt.loc.col);
          execBlock(stmt.body, local);
        }
        return;
      }
      case "while": {
        while (truthy(evalExpr(stmt.cond, e))) {
          execBlock(stmt.body, new Env(e));
        }
        return;
      }
    }
  };

  const execBlock = (body: Stmt[], e: Env) => {
    for (const s of body) execStmt(s, e);
  };

  try {
    const fns: FnDecl[] = [];
    const stmts: Stmt[] = [];
    for (const node of program.body) {
      if (node.kind === "fn") {
        fns.push(node);
        env.declare(node.name, { t: "fn", name: node.name, decl: node }, false, node.loc.line, node.loc.col);
      } else if (node.kind === "type") {
        types.set(node.name, node);
      } else {
        stmts.push(node);
      }
    }
    execBlock(stmts, env);
    let result: Value | null = null;
    const main = env.values.get("main")?.value;
    if (main && main.t === "fn") {
      try {
        result = evalCall(
          {
            kind: "call",
            callee: { kind: "ident", name: "main", loc: main.decl.loc },
            args: [],
            loc: main.decl.loc,
          },
          env,
        );
      } catch (err) {
        if (err instanceof ReturnSignal) result = err.value;
        else throw err;
      }
    }
    const shown =
      result && result.t !== "null" && result.t !== "fn" && result.t !== "native" ? display(result) : null;
    return { ok: true, output, value: shown, error: null };
  } catch (err) {
    if (err instanceof RuntimeError) {
      return { ok: false, output, value: null, error: { message: err.message, line: err.line, col: err.col } };
    }
    if (err instanceof ReturnSignal) {
      return { ok: true, output, value: display(err.value), error: null };
    }
    throw err;
  }
}
