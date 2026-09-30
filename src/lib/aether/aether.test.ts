import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMPLES } from "./examples.ts";
import { interpret } from "./interpreter.ts";
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
