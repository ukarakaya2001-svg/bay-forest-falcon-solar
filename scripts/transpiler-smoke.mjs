#!/usr/bin/env node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "../src/lib/aether/parser.ts";
import { transpile } from "../src/lib/aether/transpile.ts";

const target = process.argv.find((arg) => arg.startsWith("--target="))?.slice(9);
const allowed = new Set(["javascript", "python", "ruby", "go", "c", "cpp", "java", "kotlin", "php"]);
if (!target || !allowed.has(target)) {
  console.error("usage: transpiler-smoke.mjs --target=<supported-target>");
  process.exit(2);
}

const work = mkdtempSync(join(tmpdir(), "aether-transpiler-"));
try {
  const p = parse(`fn main() { print("Hello") }`);
  if (!p.ok) throw new Error("Aether smoke program failed to parse");
  const ext = { javascript: "js", python: "py", ruby: "rb", go: "go", c: "c", cpp: "cpp", java: "java", kotlin: "kt", php: "php" }[target];
  const filename = target === "java" ? "Aether.java" : `main.${ext}`;
  const output = join(work, filename);
  writeFileSync(output, transpile(p.program, target));

  const commands = {
    javascript: [process.execPath, [output]],
    python: ["python3", [output]],
    ruby: ["ruby", [output]],
    go: ["go", ["run", output]],
    c: ["gcc", ["-std=c11", "-Wall", "-Wextra", "-Werror", output, "-o", join(work, "a.out")]],
    cpp: ["g++", ["-std=c++20", "-Wall", "-Wextra", "-Werror", output, "-o", join(work, "a.out")]],
    java: ["javac", ["-d", work, output]],
    kotlin: ["kotlinc", [output, "-include-runtime", "-d", join(work, "app.jar")]],
    php: ["php", ["-l", output]],
  };
  execFileSync(commands[target][0], commands[target][1], { stdio: "inherit" });
  console.log(`[transpiler-smoke] ${target}: OK`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
