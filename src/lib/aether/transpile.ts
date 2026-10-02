import type { Expr, FnDecl, Program, Stmt, TypeDecl } from "./ast.ts";
import { type Target, type TargetId, targetById } from "./targets.ts";

export function transpile(program: Program, targetId: TargetId): string {
  const d = targetById(targetId);
  return new Emitter(d).emitProgram(program);
}

class Emitter {
  private i = 0;
  private lines: string[] = [];
  private d: Target;
  constructor(d: Target) {
    this.d = d;
  }

  emitProgram(program: Program): string {
    const types: TypeDecl[] = [];
    const fns: FnDecl[] = [];
    const stmts: Stmt[] = [];
    for (const n of program.body) {
      if (n.kind === "fn") fns.push(n);
      else if (n.kind === "type") types.push(n);
      else stmts.push(n);
    }
    const hasMain = fns.some((f) => f.name === "main");
    const usesPrint = JSON.stringify(program).includes('"name":"print"');

    this.header(usesPrint);
    for (const t of types) this.emitType(t);
    for (const f of fns) {
      if (this.usesGeneratedEntryPoint() && f.name === "main") continue;
      this.emitFn(f);
    }

    const mainBody = hasMain ? fns.find((f) => f.name === "main")!.body : stmts;
    const extra = hasMain ? stmts : [];

    if (this.needsClassWrap()) {
      this.openMainClass();
      for (const f of fns) {
        if (f.name !== "main") this.emitFn(f, true);
      }
      this.openMain();
      for (const s of extra) this.emitStmt(s);
      for (const s of mainBody) this.emitStmt(s);
      this.closeMain();
      this.closeMainClass();
    } else if (this.d.id === "go") {
      this.openMain();
      for (const s of extra) this.emitStmt(s);
      if (hasMain) for (const s of mainBody) this.emitStmt(s);
      else for (const s of stmts) this.emitStmt(s);
      this.closeMain();
    } else if (this.d.id === "c" || this.d.id === "cpp" || this.d.id === "rust" || this.d.id === "swift") {
      this.openMain();
      for (const s of extra) this.emitStmt(s);
      if (hasMain) for (const s of mainBody) this.emitStmt(s);
      else for (const s of stmts) this.emitStmt(s);
      this.closeMain();
    } else if (this.d.family === "hs") {
      this.emitHsMain(hasMain ? mainBody : stmts);
    } else {
      for (const s of extra) this.emitStmt(s);
      if (!hasMain) {
        for (const s of stmts) this.emitStmt(s);
      }
      if (hasMain && this.d.id === "scala") {
        this.write("@main def aetherEntry(): Unit = main();")
      } else if (hasMain && this.shouldCallMain()) {
        this.write(this.callMain());
      }
    }

    this.footer(hasMain);
    return this.lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
  }

  private pad() {
    const unit = this.d.family === "indent" || this.d.family === "hs" ? "    " : "  ";
    return unit.repeat(this.i);
  }
  private write(s: string) {
    if (s.length === 0) {
      this.lines.push("");
      return;
    }
    for (const line of s.split("\n")) this.lines.push(line.length ? this.pad() + line : "");
  }
  private semi() {
    return this.d.semi ? ";" : "";
  }

  private header(usesPrint: boolean) {
    const c = this.d.comment;
    this.write(`${c} Generated from Aether`);
    switch (this.d.id) {
      case "go":
        this.write("package main");
        this.write("");
        if (usesPrint) this.write('import "fmt"');
        this.write("");
        break;
      case "c":
        this.write("#include <stdio.h>");
        this.write("#include <stdlib.h>");
        this.write("");
        break;
      case "cpp":
        this.write("#include <iostream>");
        this.write("#include <string>");
        this.write("using namespace std;");
        this.write("");
        break;
      case "java":
        this.write("import java.util.*;");
        this.write("");
        break;
      case "csharp":
        this.write("using System;");
        this.write("using System.Collections.Generic;");
        this.write("");
        break;
      case "php":
        this.write("<?php");
        this.write("");
        break;
      case "lua":
        break;
      case "haskell":
        this.write("module Main where");
        this.write("");
        break;
      case "rust":
        this.write("");
        break;
      default:
        break;
    }
  }

  private footer(hasMain: boolean) {
    if (this.d.id === "python" && hasMain) {
      this.write("");
      this.write('if __name__ == "__main__":');
      this.i += 1;
      this.write("main()");
      this.i -= 1;
    }
    if (this.d.id === "ruby" && hasMain) {
      this.write("");
      this.write("main");
    }
    if (this.d.id === "lua" && hasMain) {
      this.write("");
      this.write("main()");
    }
    if (this.d.id === "dart" && hasMain) {
      // Dart already uses the language-level main entry point.
    }
    if (this.d.id === "elixir" && hasMain) {
      this.write("");
      this.write("main()");
    }
  }

  private needsClassWrap() {
    return this.d.id === "java" || this.d.id === "csharp";
  }

  private usesGeneratedEntryPoint() {
    return (
      this.needsClassWrap() ||
      this.d.id === "go" ||
      this.d.id === "c" ||
      this.d.id === "cpp" ||
      this.d.id === "rust" ||
      this.d.id === "swift" ||
      this.d.id === "haskell"
    );
  }
  private shouldCallMain() {
    return this.d.id === "javascript" || this.d.id === "typescript" || this.d.id === "php" || this.d.id === "scala";
  }
  private callMain() {
    return `main()${this.semi()}`;
  }

  private openMainClass() {
    if (this.d.id === "java") this.write("public class Aether {");
    if (this.d.id === "csharp") this.write("public class Aether {");
    this.i += 1;
  }
  private closeMainClass() {
    this.i -= 1;
    this.write("}");
  }
  private openMain() {
    switch (this.d.id) {
      case "java":
        this.write("public static void main(String[] args) {");
        break;
      case "csharp":
        this.write("static void Main(string[] args) {");
        break;
      case "go":
        this.write("func main() {");
        break;
      case "c":
        this.write("int main(void) {");
        break;
      case "cpp":
        this.write("int main() {");
        break;
      case "rust":
        this.write("fn main() {");
        break;
      case "swift":
        // Swift allows top-level, but wrap for clarity
        this.write("func main() {");
        break;
      default:
        this.write("function main() {");
    }
    this.i += 1;
  }
  private closeMain() {
    this.i -= 1;
    this.write("}");
    if (this.d.id === "c" || this.d.id === "cpp") {
      // return already inside if user returned; add default
    }
    if (this.d.id === "swift") {
      this.write("main()");
    }
  }

  private mapType(t: string | null): string {
    if (!t) return "";
    const table: Record<string, Record<string, string>> = {
      javascript: { int: "", float: "", str: "", bool: "", void: "", list: "", map: "" },
      typescript: { int: "number", float: "number", str: "string", bool: "boolean", void: "void", list: "any[]", map: "Record<string, any>" },
      python: { int: "int", float: "float", str: "str", bool: "bool", void: "None", list: "list", map: "dict" },
      go: { int: "int", float: "float64", str: "string", bool: "bool", void: "", list: "[]interface{}", map: "map[string]interface{}" },
      rust: { int: "i64", float: "f64", str: "String", bool: "bool", void: "()", list: "Vec<_>", map: "std::collections::HashMap<String, _>" },
      c: { int: "long", float: "double", str: "char*", bool: "int", void: "void", list: "void*", map: "void*" },
      cpp: { int: "long", float: "double", str: "string", bool: "bool", void: "void", list: "vector<auto>", map: "map<string, auto>" },
      java: { int: "int", float: "double", str: "String", bool: "boolean", void: "void", list: "List<Object>", map: "Map<String, Object>" },
      csharp: { int: "int", float: "double", str: "string", bool: "bool", void: "void", list: "List<object>", map: "Dictionary<string, object>" },
      ruby: { int: "", float: "", str: "", bool: "", void: "", list: "", map: "" },
      swift: { int: "Int", float: "Double", str: "String", bool: "Bool", void: "Void", list: "[Any]", map: "[String: Any]" },
      kotlin: { int: "Int", float: "Double", str: "String", bool: "Boolean", void: "Unit", list: "List<Any>", map: "Map<String, Any>" },
      php: { int: "int", float: "float", str: "string", bool: "bool", void: "void", list: "array", map: "array" },
      dart: { int: "int", float: "double", str: "String", bool: "bool", void: "void", list: "List", map: "Map" },
      lua: { int: "", float: "", str: "", bool: "", void: "", list: "", map: "" },
      scala: { int: "Int", float: "Double", str: "String", bool: "Boolean", void: "Unit", list: "List[Any]", map: "Map[String, Any]" },
      elixir: { int: "", float: "", str: "", bool: "", void: "", list: "", map: "" },
      haskell: { int: "Integer", float: "Double", str: "String", bool: "Bool", void: "()", list: "[a]", map: "[(String, a)]" },
    };
    const row = table[this.d.id];
    return row?.[t] ?? t;
  }


  private emitType(t: TypeDecl) {
    const fields = t.fields;
    switch (this.d.id) {
      case "typescript":
        this.write(`type ${t.name} = { ${fields.map((f) => `${f.name}: ${this.mapType(f.type) || "any"}`).join("; ")} };`);
        this.write("");
        return;
      case "python":
        this.write(`class ${t.name}:`);
        this.i += 1;
        this.write(`def __init__(self, ${fields.map((f) => f.name).join(", ")}):`);
        this.i += 1;
        for (const f of fields) this.write(`self.${f.name} = ${f.name}`);
        this.i -= 2;
        this.write("");
        return;
      case "go":
        this.write(`type ${t.name} struct {`);
        this.i += 1;
        for (const f of fields) this.write(`${capitalize(f.name)} ${this.mapType(f.type) || "interface{}"}`);
        this.i -= 1;
        this.write("}");
        this.write("");
        return;
      case "rust":
        this.write(`struct ${t.name} {`);
        this.i += 1;
        for (const f of fields) this.write(`${f.name}: ${this.mapType(f.type) || "()"},`);
        this.i -= 1;
        this.write("}");
        this.write("");
        return;
      case "java":
        this.write(`class ${t.name} {`);
        this.i += 1;
        for (const f of fields) this.write(`${this.mapType(f.type) || "Object"} ${f.name};`);
        this.i -= 1;
        this.write("}");
        this.write("");
        return;
      case "csharp":
        this.write(`class ${t.name} {`);
        this.i += 1;
        for (const f of fields) this.write(`public ${this.mapType(f.type) || "object"} ${f.name};`);
        this.i -= 1;
        this.write("}");
        this.write("");
        return;
      case "swift":
        this.write(`struct ${t.name} {`);
        this.i += 1;
        for (const f of fields) this.write(`var ${f.name}: ${this.mapType(f.type) || "Any"}`);
        this.i -= 1;
        this.write("}");
        this.write("");
        return;
      case "kotlin":
        this.write(`data class ${t.name}(${fields.map((f) => `val ${f.name}: ${this.mapType(f.type) || "Any"}`).join(", ")})`);
        this.write("");
        return;
      case "scala":
        this.write(`case class ${t.name}(${fields.map((f) => `${f.name}: ${this.mapType(f.type) || "Any"}`).join(", ")})`);
        this.write("");
        return;
      case "haskell":
        this.write(`data ${t.name} = ${t.name} { ${fields.map((f) => `${f.name} :: ${this.mapType(f.type) || "a"}`).join(", ")} }`);
        this.write("");
        return;
      default:
        this.write(`${this.d.comment} type ${t.name}: ${fields.map((f) => f.name).join(", ")}`);
        return;
    }
  }

  private emitFn(fn: FnDecl, asStatic = false) {
    if (this.d.id === "haskell") {
      this.emitHsFn(fn);
      return;
    }
    const params = fn.params.map((p) => this.param(p.name, p.type)).join(", ");
    const ret = this.mapType(fn.ret);
    const head = this.fnHead(fn.name, params, ret, asStatic);
    this.openBlock(head);
    for (const s of fn.body) this.emitStmt(s);
    this.closeBlock();
    this.write("");
  }

  private fnHead(name: string, params: string, ret: string, asStatic: boolean): string {
    switch (this.d.id) {
      case "javascript":
        return `function ${name}(${params})`;
      case "typescript":
        return `function ${name}(${params})${ret ? `: ${ret}` : ""}`;
      case "python":
        return `def ${name}(${params})${ret ? ` -> ${ret}` : ""}`;
      case "go":
        return `func ${name}(${params})${ret ? ` ${ret}` : ""}`;
      case "rust":
        return `fn ${name}(${params})${ret && ret !== "()" ? ` -> ${ret}` : ""}`;
      case "c":
      case "cpp":
        return `${ret || "void"} ${name}(${params || "void"})`;
      case "java":
        return `static ${ret || "void"} ${name}(${params})`;
      case "csharp":
        return `static ${ret || "void"} ${name}(${params})`;
      case "ruby":
        return `def ${name}${params ? `(${params})` : ""}`;
      case "swift":
        return `func ${name}(${params})${ret ? ` -> ${ret}` : ""}`;
      case "kotlin":
        return `fun ${name}(${params})${ret && ret !== "Unit" ? `: ${ret}` : ""}`;
      case "php":
        return `function ${name}(${params})${ret ? `: ${ret}` : ""}`;
      case "dart":
        return `${ret || "void"} ${name}(${params})`;
      case "lua":
        return `function ${name}(${params})`;
      case "scala":
        return `def ${name}(${params})${ret ? `: ${ret}` : ""}`;
      case "elixir":
        return `def ${name}(${params})`;
      default:
        return `function ${name}(${params})`;
    }
  }

  private param(name: string, type: string | null): string {
    const t = this.mapType(type);
    switch (this.d.id) {
      case "javascript":
      case "ruby":
      case "lua":
      case "elixir":
      case "python":
        return this.d.id === "python" && t ? `${name}: ${t}` : name;
      case "typescript":
        return t ? `${name}: ${t}` : name;
      case "go":
        return t ? `${name} ${t}` : name;
      case "rust":
      case "swift":
      case "kotlin":
      case "scala":
      case "dart":
        return t ? `${this.d.id === "swift" ? `_ ${name}` : name}: ${t}` : name;
      case "php":
        return t ? `${t} $${name}` : `$${name}`;
      case "c":
      case "cpp":
      case "java":
      case "csharp":
        return `${t || "auto"} ${name}`;
      default:
        return name;
    }
  }

  private openBlock(head: string) {
    if (this.d.family === "indent") {
      this.write(`${head}:`);
      this.i += 1;
      return;
    }
    if (this.d.family === "end") {
      const then = this.d.id === "elixir"
        ? " do"
        : this.d.id === "lua" && /^(if|elseif|while|for)\b/.test(head)
          ? " then"
          : "";
      this.write(`${head}${then}`);
      this.i += 1;
      return;
    }
    this.write(`${head} {`);
    this.i += 1;
  }

  private closeBlock() {
    this.i -= 1;
    if (this.d.family === "indent" || this.d.family === "hs") return;
    if (this.d.family === "end") {
      this.write(this.d.endWord ?? "end");
      return;
    }
    this.write("}");
  }

  private emitStmt(stmt: Stmt) {
    switch (stmt.kind) {
      case "let": {
        const v = this.emitExpr(stmt.value);
        this.write(this.emitLet(stmt.name, stmt.type, v, stmt.isConst));
        return;
      }
      case "assign":
        this.write(`${this.emitAssignTarget(stmt.target)} = ${this.emitExpr(stmt.value)}${this.semi()}`);
        return;
      case "expr":
        this.write(`${this.emitExpr(stmt.expr)}${this.semi()}`);
        return;
      case "return": {
        const v = stmt.value ? this.emitExpr(stmt.value) : "";
        if (this.d.id === "c" || this.d.id === "cpp") {
          this.write(`return ${v || "0"};`);
          return;
        }
        if (this.d.id === "ruby" || this.d.id === "elixir" || this.d.id === "lua") {
          this.write(v ? `return ${v}` : "return");
          return;
        }
        this.write(`return${v ? ` ${v}` : ""}${this.semi()}`);
        return;
      }
      case "if":
        this.emitIf(stmt);
        return;
      case "for":
        this.emitFor(stmt);
        return;
      case "while":
        this.emitWhile(stmt);
        return;
    }
  }

  private emitLet(name: string, type: string | null, value: string, isConst: boolean): string {
    const t = this.mapType(type);
    const n = this.ident(name);
    switch (this.d.id) {
      case "javascript":
        return `${isConst ? "const" : "let"} ${n} = ${value};`;
      case "typescript":
        return `${isConst ? "const" : "let"} ${n}${t ? `: ${t}` : ""} = ${value};`;
      case "python":
      case "ruby":
      case "lua":
      case "elixir":
        return `${n} = ${value}`;
      case "go":
        return `${n} := ${value}`;
      case "rust":
        return `${isConst ? "let" : "let mut"} ${n} = ${value};`;
      case "c":
        return `${t || "long"} ${n} = ${value};`;
      case "cpp":
        return `auto ${n} = ${value};`;
      case "java":
        return `${t || "var"} ${n} = ${value};`;
      case "csharp":
        return `${t || "var"} ${n} = ${value};`;
      case "swift":
        return `${isConst ? "let" : "var"} ${n} = ${value}`;
      case "kotlin":
        return `${isConst ? "val" : "var"} ${n} = ${value}`;
      case "php":
        return `${n} = ${value};`;
      case "dart":
        return `${isConst ? "final" : "var"} ${n} = ${value};`;
      case "scala":
        return `${isConst ? "val" : "var"} ${n} = ${value}`;
      default:
        return `${n} = ${value}${this.semi()}`;
    }
  }

  private ident(name: string) {
    return this.d.id === "php" ? `$${name}` : name;
  }

  private emitAssignTarget(expr: Expr): string {
    return this.emitExpr(expr);
  }

  private emitIf(stmt: Extract<Stmt, { kind: "if" }>) {
    const cond0 = this.ifCond(stmt.cond);
    this.openIf(cond0, false);
    for (const s of stmt.then) this.emitStmt(s);
    for (const br of stmt.elseIfs) {
      this.midIf(this.ifCond(br.cond));
      for (const s of br.body) this.emitStmt(s);
    }
    if (stmt.else) {
      this.elseIf();
      for (const s of stmt.else) this.emitStmt(s);
    }
    this.closeIf();
  }

  private ifCond(expr: Expr): string {
    const c = this.emitExpr(expr);
    return this.d.ifParens ? `(${c})` : c;
  }

  private openIf(cond: string, _elif: boolean) {
    if (this.d.family === "indent") {
      this.write(`if ${cond}:`);
      this.i += 1;
      return;
    }
    if (this.d.family === "end") {
      const then = this.d.thenWord ? ` ${this.d.thenWord}` : this.d.id === "ruby" ? "" : "";
      this.write(`if ${cond}${then}`);
      this.i += 1;
      return;
    }
    this.write(`if ${cond} {`);
    this.i += 1;
  }

  private midIf(cond: string) {
    if (this.d.family === "indent") {
      this.i -= 1;
      this.write(`${this.d.elif} ${cond}:`);
      this.i += 1;
      return;
    }
    if (this.d.family === "end") {
      this.i -= 1;
      const then = this.d.thenWord ? ` ${this.d.thenWord}` : "";
      this.write(`${this.d.elif} ${cond}${then}`);
      this.i += 1;
      return;
    }
    this.i -= 1;
    this.write(`} ${this.d.elif} ${cond} {`);
    this.i += 1;
  }

  private elseIf() {
    if (this.d.family === "indent") {
      this.i -= 1;
      this.write("else:");
      this.i += 1;
      return;
    }
    if (this.d.family === "end") {
      this.i -= 1;
      this.write(this.d.id === "lua" ? "else" : "else");
      this.i += 1;
      return;
    }
    this.i -= 1;
    this.write("} else {");
    this.i += 1;
  }

  private closeIf() {
    this.i -= 1;
    if (this.d.family === "indent") return;
    if (this.d.family === "end") {
      this.write(this.d.endWord ?? "end");
      return;
    }
    this.write("}");
  }

  private emitFor(stmt: Extract<Stmt, { kind: "for" }>) {
    const name = this.ident(stmt.name);
    if (stmt.iter.kind === "range") {
      const a = this.emitExpr(stmt.iter.start);
      const b = this.emitExpr(stmt.iter.end);
      this.openRangeFor(name, a, b);
      for (const s of stmt.body) this.emitStmt(s);
      this.closeLoop();
      return;
    }
    const iter = this.emitExpr(stmt.iter);
    this.openForIn(name, iter);
    for (const s of stmt.body) this.emitStmt(s);
    this.closeLoop();
  }

  private openRangeFor(name: string, a: string, b: string) {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        this.write(`for (let ${name} = ${a}; ${name} < ${b}; ${name}++) {`);
        this.i += 1;
        return;
      case "python":
        this.write(`for ${name} in range(${a}, ${b}):`);
        this.i += 1;
        return;
      case "go":
        this.write(`for ${name} := ${a}; ${name} < ${b}; ${name}++ {`);
        this.i += 1;
        return;
      case "rust":
        this.write(`for ${name} in ${a}..${b} {`);
        this.i += 1;
        return;
      case "c":
      case "cpp":
      case "java":
      case "csharp":
      case "dart":
      case "php": {
        const t = this.d.id === "php" ? "" : this.d.id === "java" || this.d.id === "csharp" || this.d.id === "dart" ? "int " : "long ";
        const n = name;
        this.write(`for (${t}${n} = ${a}; ${n} < ${b}; ${n}++) {`);
        this.i += 1;
        return;
      }
      case "ruby":
        this.write(`(${a}...${b}).each do |${name}|`);
        this.i += 1;
        return;
      case "swift":
        this.write(`for ${name} in ${a}..<${b} {`);
        this.i += 1;
        return;
      case "kotlin":
        this.write(`for (${name} in ${a} until ${b}) {`);
        this.i += 1;
        return;
      case "lua":
        this.write(`for ${name} = ${a}, (${b}) - 1 do`);
        this.i += 1;
        return;
      case "scala":
        this.write(`for (${name} <- ${a} until ${b}) {`);
        this.i += 1;
        return;
      case "elixir":
        this.write(`Enum.each(${a}..(${b} - 1), fn ${name} ->`);
        this.i += 1;
        return;
      default:
        this.write(`for ${name} in ${a}..${b} {`);
        this.i += 1;
    }
  }

  private openForIn(name: string, iter: string) {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        this.write(`for (const ${name} of ${iter}) {`);
        break;
      case "python":
        this.write(`for ${name} in ${iter}:`);
        break;
      case "go":
        this.write(`for _, ${name} := range ${iter} {`);
        break;
      case "rust":
        this.write(`for ${name} in ${iter} {`);
        break;
      case "java":
        this.write(`for (var ${name} : ${iter}) {`);
        break;
      case "csharp":
        this.write(`foreach (var ${name} in ${iter}) {`);
        break;
      case "ruby":
        this.write(`${iter}.each do |${name}|`);
        break;
      case "swift":
        this.write(`for ${name} in ${iter} {`);
        break;
      case "kotlin":
        this.write(`for (${name} in ${iter}) {`);
        break;
      case "php":
        this.write(`foreach (${iter} as ${name}) {`);
        break;
      case "dart":
        this.write(`for (var ${name} in ${iter}) {`);
        break;
      case "lua":
        this.write(`for _, ${name} in ipairs(${iter}) do`);
        break;
      case "scala":
        this.write(`for (${name} <- ${iter}) {`);
        break;
      case "elixir":
        this.write(`Enum.each(${iter}, fn ${name} ->`);
        break;
      case "c":
      case "cpp":
        this.write(`for (auto ${name} : ${iter}) {`);
        break;
      default:
        this.write(`for ${name} in ${iter} {`);
    }
    this.i += 1;
  }

  private emitWhile(stmt: Extract<Stmt, { kind: "while" }>) {
    const c = this.ifCond(stmt.cond);
    if (this.d.family === "indent") this.write(`while ${c}:`);
    else if (this.d.family === "end") {
      const then = this.d.id === "lua" ? " do" : this.d.id === "elixir" ? " do" : "";
      this.write(`while ${c}${then}`);
    } else this.write(`while ${c} {`);
    this.i += 1;
    for (const s of stmt.body) this.emitStmt(s);
    this.closeLoop();
  }

  private closeLoop() {
    this.i -= 1;
    if (this.d.family === "indent") return;
    if (this.d.family === "end") {
      this.write(this.d.id === "elixir" ? "end)" : (this.d.endWord ?? "end"));
      return;
    }
    this.write("}");
  }

  private emitExpr(expr: Expr): string {
    switch (expr.kind) {
      case "literal":
        return this.emitLit(expr);
      case "ident":
        return this.ident(expr.name);
      case "binary":
        return this.emitBin(expr.op, this.emitExpr(expr.left), this.emitExpr(expr.right));
      case "unary":
        if (expr.op === "not") {
          const inner = this.emitExpr(expr.expr);
          if (this.d.id === "python") return `not ${inner}`;
          if (this.d.id === "lua") return `not ${inner}`;
          if (this.d.id === "haskell") return `not ${inner}`;
          if (this.d.id === "elixir") return `!${inner}`;
          return `!${inner}`;
        }
        return `-${this.emitExpr(expr.expr)}`;
      case "call":
        return this.emitCall(expr);
      case "index":
        return this.emitIndex(this.emitExpr(expr.obj), this.emitExpr(expr.index));
      case "member":
        return this.emitMember(this.emitExpr(expr.obj), expr.name);
      case "list":
        return this.emitList(expr.items.map((x) => this.emitExpr(x)));
      case "map":
        return this.emitMap(expr.entries.map((e) => [e.key, this.emitExpr(e.value)] as [string, string]));
      case "struct":
        return this.emitStruct(expr.name, expr.entries.map((e) => [e.key, this.emitExpr(e.value)] as [string, string]));
      case "range":
        return this.emitRange(this.emitExpr(expr.start), this.emitExpr(expr.end));
    }
  }

  private emitLit(expr: Extract<Expr, { kind: "literal" }>): string {
    if (expr.raw === "str") return this.quote(String(expr.value));
    if (expr.raw === "bool") {
      if (this.d.id === "python") return expr.value ? "True" : "False";
      if (this.d.id === "c") return expr.value ? "1" : "0";
      if (this.d.id === "haskell") return expr.value ? "True" : "False";
      if (this.d.id === "lua") return expr.value ? "true" : "false";
      if (this.d.id === "ruby") return expr.value ? "true" : "false";
      return expr.value ? "true" : "false";
    }
    if (expr.raw === "null") {
      const n: Record<string, string> = {
        python: "None",
        go: "nil",
        rust: "None",
        ruby: "nil",
        lua: "nil",
        swift: "nil",
        c: "NULL",
        cpp: "nullptr",
        java: "null",
        csharp: "null",
        php: "null",
        dart: "null",
        kotlin: "null",
        scala: "null",
        elixir: "nil",
        haskell: "Nothing",
        javascript: "null",
        typescript: "null",
      };
      return n[this.d.id] ?? "null";
    }
    return String(expr.value);
  }

  private quote(s: string) {
    const q = JSON.stringify(s);
    if (this.d.id === "c") return q;
    return q;
  }

  private emitBin(op: string, l: string, r: string): string {
    if (op === "and") {
      if (this.d.id === "python" || this.d.id === "lua" || this.d.id === "haskell") return `(${l} and ${r})`;
      return `(${l} && ${r})`;
    }
    if (op === "or") {
      if (this.d.id === "python" || this.d.id === "lua" || this.d.id === "haskell") return `(${l} or ${r})`;
      return `(${l} || ${r})`;
    }
    if (op === "+" && this.d.id === "lua") {
      // Lua uses .. for strings; keep + for numbers. Best-effort: use ..
      // Leave + — numeric examples still work; string concat in lua is imperfect.
    }
    if (op === "==" && this.d.id === "lua") return `(${l} == ${r})`;
    if (op === "!=" && this.d.id === "lua") return `(${l} ~= ${r})`;
    if (op === "!=" && this.d.id === "python") return `(${l} != ${r})`;
    if (op === "!=" && this.d.id === "haskell") return `(${l} /= ${r})`;
    if (op === "/" && this.d.id === "python") return "(" + l + " // " + r + ")";
    if (op === "%" && this.d.id === "lua") return `(${l} % ${r})`;
    return `(${l} ${op} ${r})`;
  }

  private emitCall(expr: Extract<Expr, { kind: "call" }>): string {
    const args = expr.args.map((a) => this.emitExpr(a));
    if (expr.callee.kind === "ident") {
      const n = expr.callee.name;
      if (n === "print") return this.emitPrint(args, expr.args);
      if (n === "str") return this.emitStr(args[0] ?? '""');
      if (n === "len") return this.emitLen(args[0] ?? "0");
      if (n === "int") return this.emitIntCast(args[0] ?? "0");
      if (n === "float") return this.emitFloatCast(args[0] ?? "0");
      if (this.d.id === "php") return `${n}(${args.join(", ")})`;
      return `${n}(${args.join(", ")})`;
    }
    return `${this.emitExpr(expr.callee)}(${args.join(", ")})`;
  }

  private emitPrint(args: string[], sourceExprs?: Expr[]): string {
    const joined = args.join(", ");
    const spaceJoin = args.join(' + " " + ');
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        return "console.log(" + joined + ")";
      case "python":
        return "print(" + joined + ")";
      case "go":
        return "fmt.Println(" + joined + ")";
      case "rust":
        if (args.length === 0) return "println!()";
        if (args.length === 1) return 'println!("{}", ' + args[0] + ")";
        return (
          'println!("{}", vec![' +
          args.map((a) => 'format!("{}", ' + a + ")").join(", ") +
          '].join(" "))'
        );
      case "c":
        if (args.length === 1) return 'printf("%s\\n", ' + args[0] + ")";
        return 'printf("%s\\n", ' + joined + ")";
      case "cpp":
        return "cout " + args.map((a) => "<< " + a).join(' << " " ') + " << endl";
      case "java":
        return "System.out.println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
      case "csharp":
        return "Console.WriteLine(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
      case "ruby":
        return "puts " + joined;
      case "swift":
        return "print(" + joined + ")";
      case "kotlin":
        return "println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
      case "php":
        return "echo " + args.join('. " " . ') + ', "\\n"';
      case "dart":
        return "print(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
      case "lua":
        return "print(" + joined + ")";
      case "scala":
        return "println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
      case "elixir":
        return args.length === 1
          ? "IO.puts(" + args[0] + ")"
          : "IO.puts(Enum.join([" + joined + '], " "))';
      case "haskell": {
        const rendered = args.map((a, index) => {
          const source = sourceExprs?.[index];
          return source?.kind === "literal" && source.raw === "str" ? a : `show ${a}`;
        });
        return rendered.length === 1
          ? `putStrLn ${rendered[0] ?? "\"\""}`
          : `putStrLn (unwords [${rendered.join(", ")}])`;
      }
      default:
        return "print(" + joined + ")";
    }
  }

  private emitStr(x: string): string {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        return `String(${x})`;
      case "python":
        return `str(${x})`;
      case "go":
        return `fmt.Sprint(${x})`;
      case "rust":
        return `format!("{}", ${x})`;
      case "java":
        return `String.valueOf(${x})`;
      case "csharp":
        return `${x}.ToString()`;
      case "ruby":
        return `${x}.to_s`;
      case "swift":
        return `String(${x})`;
      case "kotlin":
        return `${x}.toString()`;
      case "php":
        return `(string) ${x}`;
      case "dart":
        return `${x}.toString()`;
      case "lua":
        return `tostring(${x})`;
      case "scala":
        return `${x}.toString`;
      case "elixir":
        return `to_string(${x})`;
      case "c":
        return `/* str */ ${x}`;
      case "cpp":
        return `to_string(${x})`;
      case "haskell":
        return `show ${x}`;
      default:
        return `str(${x})`;
    }
  }

  private emitLen(x: string): string {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
      case "dart":
        return `${x}.length`;
      case "python":
      case "go":
        return `len(${x})`;
      case "rust":
        return `${x}.len()`;
      case "java":
        return `${x}.size()`;
      case "csharp":
        return `${x}.Count`;
      case "ruby":
        return `${x}.length`;
      case "swift":
        return `${x}.count`;
      case "kotlin":
        return `${x}.size`;
      case "php":
        return `count(${x})`;
      case "lua":
        return `#${x}`;
      case "scala":
        return `${x}.length`;
      case "elixir":
        return `length(${x})`;
      case "c":
        return `sizeof(${x})`;
      case "cpp":
        return `${x}.size()`;
      case "haskell":
        return `length ${x}`;
      default:
        return `len(${x})`;
    }
  }

  private emitIntCast(x: string): string {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        return `Number.parseInt(${x}, 10)`;
      case "python":
        return `int(${x})`;
      case "go":
        return `int(${x})`;
      case "rust":
        return `${x} as i64`;
      case "java":
        return `(int) ${x}`;
      case "c":
      case "cpp":
        return `(long) ${x}`;
      case "csharp":
        return `Convert.ToInt32(${x})`;
      default:
        return `int(${x})`;
    }
  }

  private emitFloatCast(x: string): string {
    switch (this.d.id) {
      case "javascript":
      case "typescript":
        return `Number(${x})`;
      case "python":
        return `float(${x})`;
      case "go":
        return `float64(${x})`;
      case "rust":
        return `${x} as f64`;
      default:
        return `float(${x})`;
    }
  }

  private emitIndex(obj: string, i: string): string {
    if (this.d.id === "lua") return `${obj}[(${i}) + 1]`;
    if (this.d.id === "haskell") return `(${obj} !! ${i})`;
    return `${obj}[${i}]`;
  }

  private emitMember(obj: string, name: string): string {
    if (this.d.id === "lua" || this.d.id === "elixir") return `${obj}.${name}`;
    if (this.d.id === "go") return `${obj}.${capitalize(name)}`;
    if (this.d.id === "python") return `${obj}["${name}"]`;
    if (this.d.id === "ruby") return `${obj}[:${name}]`;
    return `${obj}.${name}`;
  }

  private emitList(items: string[]): string {
    const inner = items.join(", ");
    switch (this.d.id) {
      case "go":
        return `[]interface{}{${inner}}`;
      case "rust":
        return `vec![${inner}]`;
      case "java":
        return `Arrays.asList(${inner})`;
      case "csharp":
        return `new List<object> { ${inner} }`;
      case "lua":
        return `{${inner}}`;
      case "scala":
        return `List(${inner})`;
      case "elixir":
        return `[${inner}]`;
      case "haskell":
        return `[${inner}]`;
      case "swift":
        return `[${inner}]`;
      case "php":
        return `[${inner}]`;
      default:
        return `[${inner}]`;
    }
  }

  private emitMap(entries: [string, string][]): string {
    switch (this.d.id) {
      case "python":
        return `{${entries.map(([k, v]) => `"${k}": ${v}`).join(", ")}}`;
      case "javascript":
      case "typescript":
        return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
      case "go":
        return `map[string]interface{}{${entries.map(([k, v]) => `"${k}": ${v}`).join(", ")}}`;
      case "ruby":
        return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
      case "lua":
        return `{ ${entries.map(([k, v]) => `${k} = ${v}`).join(", ")} }`;
      case "php":
        return `[${entries.map(([k, v]) => `"${k}" => ${v}`).join(", ")}]`;
      case "elixir":
        return `%{${entries.map(([k, v]) => `${k}: ${v}`).join(", ")}}`;
      case "java":
        return `Map.of(${entries.flatMap(([k, v]) => [`"${k}"`, v]).join(", ")})`;
      default:
        return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
    }
  }

  private emitStruct(name: string, entries: [string, string][]): string {
    switch (this.d.id) {
      case "python":
        return `${name}(${entries.map(([, v]) => v).join(", ")})`;
      case "go":
        return `${name}{${entries.map(([k, v]) => `${capitalize(k)}: ${v}`).join(", ")}}`;
      case "rust":
      case "swift":
      case "kotlin":
      case "scala":
        return `${name} { ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`.replace(" { ", this.d.id === "kotlin" || this.d.id === "scala" ? "(" : " { ").replace(/ }$/, this.d.id === "kotlin" || this.d.id === "scala" ? ")" : " }");
      case "java":
        return `new ${name}() /* ${entries.map(([k, v]) => `${k}=${v}`).join(", ")} */`;
      case "haskell":
        return `${name} { ${entries.map(([k, v]) => `${k} = ${v}`).join(", ")} }`;
      default:
        return this.emitMap(entries);
    }
  }

  private emitRange(a: string, b: string): string {
    switch (this.d.id) {
      case "python":
        return `range(${a}, ${b})`;
      case "rust":
        return `${a}..${b}`;
      case "ruby":
        return `(${a}...${b})`;
      case "swift":
        return `${a}..<${b}`;
      case "kotlin":
        return `${a} until ${b}`;
      case "elixir":
        return `${a}..(${b} - 1)`;
      case "haskell":
        return `[${a}..(${b} - 1)]`;
      default:
        return `/* range ${a}..${b} */`;
    }
  }

  private emitHsFn(fn: FnDecl) {
    const args = fn.params.map((p) => p.name).join(" ");
    const types = fn.params.map((p) => this.mapType(p.type) || "a").join(" -> ");
    const ret = this.mapType(fn.ret) || "()";
    const sig = fn.params.length ? `${fn.name} :: ${types} -> ${ret}` : `${fn.name} :: ${ret}`;
    this.write(sig);
    if (fn.body.length === 1 && fn.body[0]!.kind === "return" && fn.body[0]!.value) {
      this.write(`${fn.name} ${args} = ${this.emitExpr(fn.body[0]!.value)}`);
      this.write("");
      return;
    }
    this.write(`${fn.name} ${args} =`);
    this.i += 1;
    this.emitHsStmts(fn.body);
    this.i -= 1;
    this.write("");
  }

  private emitHsMain(body: Stmt[]) {
    this.write("main :: IO ()");
    this.write("main = do");
    this.i += 1;
    if (body.length === 0) this.write("return ()");
    else this.emitHsStmts(body);
    this.i -= 1;
  }

  private emitHsStmts(body: Stmt[]) {
    for (const s of body) {
      if (s.kind === "expr") this.write(this.emitExpr(s.expr));
      else if (s.kind === "let") this.write(`let ${s.name} = ${this.emitExpr(s.value)}`);
      else if (s.kind === "return" && s.value) this.write(this.emitExpr(s.value));
      else if (s.kind === "if") {
        this.write(`if ${this.emitExpr(s.cond)}`);
        this.write(`  then ${s.then[0] ? this.hsInline(s.then[0]) : "return ()"}`);
        this.write(`  else ${s.else?.[0] ? this.hsInline(s.else[0]) : "return ()"}`);
      } else if (s.kind === "for" && s.iter.kind === "range") {
        this.write(`mapM_ (\\${s.name} -> do`);
        this.i += 1;
        this.emitHsStmts(s.body);
        this.i -= 1;
        this.write(`  ) [${this.emitExpr(s.iter.start)}..(${this.emitExpr(s.iter.end)} - 1)]`);
      } else {
        this.write(`${this.d.comment} ${s.kind}`);
      }
    }
  }

  private hsInline(s: Stmt): string {
    if (s.kind === "expr") return this.emitExpr(s.expr);
    if (s.kind === "return" && s.value) return this.emitExpr(s.value);
    return "return ()";
  }
}

function capitalize(s: string) {
  return s.length ? s[0]!.toUpperCase() + s.slice(1) : s;
}
