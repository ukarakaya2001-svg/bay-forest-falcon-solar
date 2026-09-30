import type { CompileError } from "./ast.ts";
import { interpret, type RunResult } from "./interpreter.ts";
import { parse } from "./parser.ts";
import { transpile } from "./transpile.ts";
import type { TargetId } from "./targets.ts";

export { EXAMPLES, DEFAULT_SOURCE } from "./examples.ts";
export { highlightAether, highlightTarget } from "./highlight.ts";
export { TARGETS, targetById, type Target, type TargetId } from "./targets.ts";
export { parse } from "./parser.ts";
export { interpret } from "./interpreter.ts";
export { transpile } from "./transpile.ts";
export type { CompileError } from "./ast.ts";
export type { RunResult } from "./interpreter.ts";

export type CompileOk = { ok: true; errors: CompileError[] };
export type CompileErr = { ok: false; errors: CompileError[] };

export function compile(source: string): CompileOk | CompileErr {
  const result = parse(source);
  if (!result.ok) return { ok: false, errors: result.errors };
  return { ok: true, errors: [] };
}

export function run(source: string): RunResult {
  const result = parse(source);
  if (!result.ok) {
    const e = result.errors[0]!;
    return { ok: false, output: [], value: null, error: e };
  }
  return interpret(result.program);
}

export function emit(source: string, target: TargetId): { ok: true; code: string } | { ok: false; errors: CompileError[]; code: string } {
  const result = parse(source);
  if (!result.ok) return { ok: false, errors: result.errors, code: "" };
  return { ok: true, code: transpile(result.program, target) };
}
