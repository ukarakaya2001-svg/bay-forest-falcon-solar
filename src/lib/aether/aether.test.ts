import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMPLES } from "./examples.ts";
import { interpret } from "./interpreter.ts";
import { lex, LexError } from "./lexer.ts";
import { parse } from "./parser.ts";
import { transpile } from "./transpile.ts";

function run(source: string) {
  const p = parse(source);
  if (!p.ok) return { ok: false as const, output: [] as string[], error: p.errors[0]! };
  return interpret(p.program);
}

function emit(source: string, target: Parameters<typeof transpile>[1]) {
  const p = parse(source);
  if (!p.ok) return { ok: false as const, code: "" };
  return { ok: true as const, code: transpile(p.program, target) };
}

test("hello runs", () => {
  const r = run(`fn main() { print("Hello, Aether") }`);
  assert.equal(r.ok, true);
  assert.deepEqual(r.output, ["Hello, Aether"]);
});

test("fizzbuzz", () => {
  const r = run(EXAMPLES.find((e) => e.id === "fizzbuzz")!.code);
  assert.equal(r.ok, true);
  assert.equal(r.output[0], "1");
  assert.equal(r.output[2], "Fizz");
  assert.equal(r.output[4], "Buzz");
  assert.equal(r.output[14], "FizzBuzz");
});

test("fibonacci", () => {
  const r = run(EXAMPLES.find((e) => e.id === "fib")!.code);
  assert.equal(r.ok, true);
  assert.equal(r.output[0], "fib(0) = 0");
  assert.equal(r.output[7], "fib(7) = 13");
});

test("factorial", () => {
  const r = run(EXAMPLES.find((e) => e.id === "factorial")!.code);
  assert.equal(r.ok, true);
  assert.deepEqual(r.output, ["720"]);
});

test("lists", () => {
  const r = run(EXAMPLES.find((e) => e.id === "lists")!.code);
  assert.equal(r.ok, true);
  assert.equal(r.output[2], "sum 14");
});

test("person struct", () => {
  const r = run(EXAMPLES.find((e) => e.id === "person")!.code);
  assert.equal(r.ok, true);
  assert.equal(r.output[0], "Ada Lovelace");
});

test("collatz integer division", () => {
  const r = run(EXAMPLES.find((e) => e.id === "collatz")!.code);
  assert.equal(r.ok, true);
  assert.equal(r.output[0], "27 takes 111 steps");
});

test("primes", () => {
  const r = run(EXAMPLES.find((e) => e.id === "primes")!.code);
  assert.equal(r.ok, true);
  assert.deepEqual(r.output.slice(0, 5), ["2", "3", "5", "7", "11"]);
});

test("palindrome", () => {
  const r = run(EXAMPLES.find((e) => e.id === "palindrome")!.code);
  assert.equal(r.ok, true);
  assert.deepEqual(r.output, ["true", "false"]);
});

test("parse error has line", () => {
  const p = parse(`fn main( {`);
  assert.equal(p.ok, false);
});

test("transpile python fizzbuzz", () => {
  const e = emit(EXAMPLES.find((x) => x.id === "fizzbuzz")!.code, "python");
  assert.equal(e.ok, true);
  if (!e.ok) return;
  assert.match(e.code, /def main/);
  assert.match(e.code, /elif/);
  assert.match(e.code, /range\(1, 16\)/);
});

test("transpile go and rust", () => {
  const src = EXAMPLES.find((x) => x.id === "hello")!.code;
  const go = emit(src, "go");
  const rs = emit(src, "rust");
  assert.equal(go.ok, true);
  assert.equal(rs.ok, true);
  if (go.ok) assert.match(go.code, /package main/);
  if (rs.ok) assert.match(rs.code, /fn main/);
});

test("all examples parse", () => {
  for (const ex of EXAMPLES) {
    const p = parse(ex.code);
    assert.equal(p.ok, true, ex.id);
  }
});

test("syntax highlighting escapes HTML metacharacters", async () => {
  const { highlightAether } = await import("./highlight.ts");
  const html = highlightAether(`<img src=x onerror="alert(1)">`);
  assert.match(html, /&lt;\/span>|&lt;/);
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /onerror=/i);
});

test("generated entry points do not duplicate user main", () => {
  const src = `fn main() { print("hello") }`;
  for (const target of ["go", "c", "cpp", "rust", "swift", "java", "csharp", "haskell"] as const) {
    const e = emit(src, target);
    assert.equal(e.ok, true, target);
    if (!e.ok) continue;
    const declarations = (e.code.match(/(?:fn|func|void|int|public static void|static void|function)\s+[Mm]ain\s*\(/g) ?? []);
    if (target === "haskell") {
      assert.equal((e.code.match(/^main ::/gm) ?? []).length, 1, target);
    } else {
      assert.equal(declarations.length, 1, target);
    }
  }
});

test("omitted function return type is not forced to integer", () => {
  const src = `fn main() { print("hello") }`;
  for (const target of ["typescript", "go", "rust", "swift", "kotlin", "php", "dart", "scala"] as const) {
    const e = emit(src, target);
    assert.equal(e.ok, true, target);
    if (!e.ok) continue;
    assert.doesNotMatch(e.code, /main\([^)]*\)\s*(?::|->|\s+)\s*(number|int|i64|Int|long)\b/);
  }
});

test("lua main has no invalid then keyword", () => {
  const e = emit(`fn main() { print("hello") }`, "lua");
  assert.equal(e.ok, true);
  if (e.ok) assert.match(e.code, /function main\(\)\n/);
});


test("lexer rejects oversized source before parsing", () => {
  assert.throws(() => lex("a".repeat(1_000_001)), (err: unknown) => {
    assert.ok(err instanceof LexError);
    assert.match((err as Error).message, /1000000/);
    return true;
  });
});

test("interpreter rejects oversized ranges before allocation", () => {
  const p = parse(`fn main() { let xs = 0..100001; print(len(xs)) }`);
  assert.equal(p.ok, true);
  if (p.ok) {
    const result = interpret(p.program);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error.message, /Range size limit/);
  }
});

test("interpreter bounds output volume", () => {
  const p = parse(`fn main() { for i in 0..10001 { print(i) } }`);
  assert.equal(p.ok, true);
  if (p.ok) {
    const result = interpret(p.program);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error.message, /Output line limit/);
  }
});

test("interpreter renders cyclic values without recursing forever", () => {
  const p = parse(`fn main() { let xs = [null]; xs[0] = xs; print(xs) }`);
  assert.equal(p.ok, true);
  if (p.ok) {
    const result = interpret(p.program);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.output, ["[<cycle>]"]);
  }
});

test("entry-point conventions are target-correct for Dart, Scala, and Haskell", () => {
  const src = `fn main() { print("Hello") }`;
  const dart = emit(src, "dart");
  const scala = emit(src, "scala");
  const haskell = emit(src, "haskell");
  assert.equal(dart.ok, true);
  assert.equal(scala.ok, true);
  assert.equal(haskell.ok, true);
  if (dart.ok) assert.equal((dart.code.match(/void main\(/g) ?? []).length, 1);
  if (scala.ok) assert.match(scala.code, /@main def aetherEntry/);
  if (haskell.ok) assert.match(haskell.code, /putStrLn "Hello"/);
});

test("all 18 declared targets emit non-empty source", async () => {
  const { TARGETS } = await import("./targets.ts");
  const src = `fn main() { print("Hello") }`;
  const p = parse(src);
  assert.equal(p.ok, true);
  if (!p.ok) return;
  for (const target of TARGETS) {
    const code = transpile(p.program, target.id);
    assert.ok(code.trim().length > 0, target.id);
  }
});
