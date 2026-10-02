import { a as LexError, d as targetById, u as lex } from "./highlight-LGEX9ycG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/aether-D-y4C89j.js
var RuntimeError = class extends Error {
	line;
	col;
	constructor(message, line, col) {
		super(message);
		this.line = line;
		this.col = col;
	}
};
var ReturnSignal = class {
	value;
	constructor(value) {
		this.value = value;
	}
};
var Env = class {
	parent;
	values;
	constructor(parent = null, values = /* @__PURE__ */ new Map()) {
		this.parent = parent;
		this.values = values;
	}
	declare(name, value, mut, line, col) {
		if (this.values.has(name)) throw new RuntimeError(`'${name}' is already defined in this scope`, line, col);
		this.values.set(name, {
			value,
			mut
		});
	}
	set(name, value, line, col) {
		let e = this;
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
	get(name, line, col) {
		let e = this;
		while (e) {
			const slot = e.values.get(name);
			if (slot) return slot.value;
			e = e.parent;
		}
		throw new RuntimeError(`Unknown name '${name}'`, line, col);
	}
};
var MAX_STEPS = 25e4;
var MAX_DEPTH = 400;
var MAX_COLLECTION_ITEMS = 1e5;
var MAX_OUTPUT_LINES = 1e4;
var MAX_OUTPUT_CHARS = 1e6;
var MAX_DISPLAY_DEPTH = 100;
var MAX_STRING_CHARS = 1e6;
function interpret(program) {
	const output = [];
	let steps = 0;
	let depth = 0;
	const tick = (line, col) => {
		steps += 1;
		if (steps > MAX_STEPS) throw new RuntimeError("Execution limit reached (infinite loop?)", line, col);
	};
	const display = (v, seen = /* @__PURE__ */ new Set(), depth = 0) => {
		if (depth > MAX_DISPLAY_DEPTH) return "<depth-limit>";
		switch (v.t) {
			case "int": return String(v.v);
			case "float": {
				const s = String(v.v);
				return s.includes(".") ? s : `${s}.0`;
			}
			case "str": return v.v;
			case "bool": return v.v ? "true" : "false";
			case "null": return "null";
			case "list": {
				if (seen.has(v)) return "<cycle>";
				seen.add(v);
				const out = `[${v.v.map((item) => display(item, seen, depth + 1)).join(", ")}]`;
				seen.delete(v);
				return out;
			}
			case "map": {
				if (seen.has(v)) return "<cycle>";
				seen.add(v);
				const parts = [];
				v.v.forEach((val, key) => parts.push(`${key}: ${display(val, seen, depth + 1)}`));
				seen.delete(v);
				return `{ ${parts.join(", ")} }`;
			}
			case "fn": return `<fn ${v.name}>`;
			case "native": return `<fn ${v.name}>`;
		}
	};
	const truthy = (v) => {
		if (v.t === "bool") return v.v;
		if (v.t === "null") return false;
		if (v.t === "int" || v.t === "float") return v.v !== 0;
		if (v.t === "str") return v.v.length > 0;
		if (v.t === "list") return v.v.length > 0;
		return true;
	};
	const num = (v, line, col) => {
		if (v.t === "int" || v.t === "float") return v;
		throw new RuntimeError("Expected a number", line, col);
	};
	const eq = (a, b) => {
		if (a.t === "null" || b.t === "null") return a.t === "null" && b.t === "null";
		if ((a.t === "int" || a.t === "float") && (b.t === "int" || b.t === "float")) return a.v === b.v;
		if (a.t !== b.t) return false;
		if (a.t === "str" && b.t === "str") return a.v === b.v;
		if (a.t === "bool" && b.t === "bool") return a.v === b.v;
		if (a.t === "list" && b.t === "list") {
			if (a.v.length !== b.v.length) return false;
			return a.v.every((x, i) => eq(x, b.v[i]));
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
	const native = (name, impl) => {
		env.declare(name, {
			t: "native",
			name,
			impl
		}, false, 1, 1);
	};
	native("print", (...args) => {
		if (output.length >= MAX_OUTPUT_LINES) throw new RuntimeError("Output line limit reached", 1, 1);
		const line = args.map((arg) => display(arg)).join(" ");
		if (output.reduce((total, item) => total + item.length + 1, 0) + line.length + 1 > MAX_OUTPUT_CHARS) throw new RuntimeError("Output size limit reached", 1, 1);
		output.push(line);
		return { t: "null" };
	});
	native("str", (v) => {
		if (!v) return {
			t: "str",
			v: "null"
		};
		return {
			t: "str",
			v: display(v)
		};
	});
	native("len", (v) => {
		if (!v) throw new RuntimeError("len() expected a value", 1, 1);
		if (v.t === "str") return {
			t: "int",
			v: v.v.length
		};
		if (v.t === "list") return {
			t: "int",
			v: v.v.length
		};
		if (v.t === "map") return {
			t: "int",
			v: v.v.size
		};
		throw new RuntimeError("len() expected a list, map, or string", 1, 1);
	});
	native("int", (v) => {
		if (!v) return {
			t: "int",
			v: 0
		};
		if (v.t === "int") return v;
		if (v.t === "float") return {
			t: "int",
			v: Math.trunc(v.v)
		};
		if (v.t === "str") {
			const n = Number.parseInt(v.v, 10);
			if (Number.isNaN(n)) throw new RuntimeError(`Cannot convert '${v.v}' to int`, 1, 1);
			return {
				t: "int",
				v: n
			};
		}
		if (v.t === "bool") return {
			t: "int",
			v: v.v ? 1 : 0
		};
		throw new RuntimeError("Cannot convert to int", 1, 1);
	});
	native("float", (v) => {
		if (!v) return {
			t: "float",
			v: 0
		};
		if (v.t === "float") return v;
		if (v.t === "int") return {
			t: "float",
			v: v.v
		};
		if (v.t === "str") {
			const n = Number.parseFloat(v.v);
			if (Number.isNaN(n)) throw new RuntimeError(`Cannot convert '${v.v}' to float`, 1, 1);
			return {
				t: "float",
				v: n
			};
		}
		throw new RuntimeError("Cannot convert to float", 1, 1);
	});
	const types = /* @__PURE__ */ new Map();
	const evalExpr = (expr, e) => {
		tick(expr.loc.line, expr.loc.col);
		switch (expr.kind) {
			case "literal":
				if (expr.raw === "int") return {
					t: "int",
					v: expr.value
				};
				if (expr.raw === "float") return {
					t: "float",
					v: expr.value
				};
				if (expr.raw === "str") return {
					t: "str",
					v: expr.value
				};
				if (expr.raw === "bool") return {
					t: "bool",
					v: expr.value
				};
				return { t: "null" };
			case "ident": return e.get(expr.name, expr.loc.line, expr.loc.col);
			case "list":
				if (expr.items.length > MAX_COLLECTION_ITEMS) throw new RuntimeError("List size limit reached", expr.loc.line, expr.loc.col);
				return {
					t: "list",
					v: expr.items.map((x) => evalExpr(x, e))
				};
			case "map": {
				if (expr.entries.length > MAX_COLLECTION_ITEMS) throw new RuntimeError("Map size limit reached", expr.loc.line, expr.loc.col);
				const m = /* @__PURE__ */ new Map();
				for (const ent of expr.entries) m.set(ent.key, evalExpr(ent.value, e));
				return {
					t: "map",
					v: m
				};
			}
			case "struct": {
				if (expr.entries.length > MAX_COLLECTION_ITEMS) throw new RuntimeError("Struct field limit reached", expr.loc.line, expr.loc.col);
				const m = /* @__PURE__ */ new Map();
				m.set("__type", {
					t: "str",
					v: expr.name
				});
				for (const ent of expr.entries) m.set(ent.key, evalExpr(ent.value, e));
				return {
					t: "map",
					v: m
				};
			}
			case "range": {
				const a = num(evalExpr(expr.start, e), expr.loc.line, expr.loc.col);
				const b = num(evalExpr(expr.end, e), expr.loc.line, expr.loc.col);
				const start = Math.trunc(a.v);
				const end = Math.trunc(b.v);
				const distance = Math.abs(end - start);
				if (!Number.isSafeInteger(distance) || distance > MAX_COLLECTION_ITEMS) throw new RuntimeError("Range size limit reached", expr.loc.line, expr.loc.col);
				const items = [];
				if (end >= start) for (let i = start; i < end; i++) items.push({
					t: "int",
					v: i
				});
				else for (let i = start; i > end; i--) items.push({
					t: "int",
					v: i
				});
				return {
					t: "list",
					v: items
				};
			}
			case "unary": {
				const v = evalExpr(expr.expr, e);
				if (expr.op === "not") return {
					t: "bool",
					v: !truthy(v)
				};
				const n = num(v, expr.loc.line, expr.loc.col);
				return {
					t: n.t,
					v: -n.v
				};
			}
			case "binary": return evalBinary(expr.op, evalExpr(expr.left, e), evalExpr(expr.right, e), expr.loc.line, expr.loc.col);
			case "call": return evalCall(expr, e);
			case "index": {
				const obj = evalExpr(expr.obj, e);
				const idx = evalExpr(expr.index, e);
				if (obj.t === "list") {
					const i = num(idx, expr.loc.line, expr.loc.col);
					const k = Math.trunc(i.v);
					if (k < 0 || k >= obj.v.length) throw new RuntimeError("List index out of range", expr.loc.line, expr.loc.col);
					return obj.v[k];
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
					if (k < 0 || k >= obj.v.length) throw new RuntimeError("String index out of range", expr.loc.line, expr.loc.col);
					return {
						t: "str",
						v: obj.v[k]
					};
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
	const evalBinary = (op, left, right, line, col) => {
		switch (op) {
			case "or": return {
				t: "bool",
				v: truthy(left) || truthy(right)
			};
			case "and": return {
				t: "bool",
				v: truthy(left) && truthy(right)
			};
			case "==": return {
				t: "bool",
				v: eq(left, right)
			};
			case "!=": return {
				t: "bool",
				v: !eq(left, right)
			};
			case "<":
			case ">":
			case "<=":
			case ">=":
				if ((left.t === "int" || left.t === "float") && (right.t === "int" || right.t === "float")) return {
					t: "bool",
					v: op === "<" ? left.v < right.v : op === ">" ? left.v > right.v : op === "<=" ? left.v <= right.v : left.v >= right.v
				};
				if (left.t === "str" && right.t === "str") return {
					t: "bool",
					v: op === "<" ? left.v < right.v : op === ">" ? left.v > right.v : op === "<=" ? left.v <= right.v : left.v >= right.v
				};
				throw new RuntimeError("Cannot compare these values", line, col);
			case "+":
				if (left.t === "str" || right.t === "str") {
					const joined = display(left) + display(right);
					if (joined.length > MAX_STRING_CHARS) throw new RuntimeError("String size limit reached", line, col);
					return {
						t: "str",
						v: joined
					};
				}
				if ((left.t === "int" || left.t === "float") && (right.t === "int" || right.t === "float")) {
					const v = left.v + right.v;
					return left.t === "float" || right.t === "float" ? {
						t: "float",
						v
					} : {
						t: "int",
						v
					};
				}
				if (left.t === "list" && right.t === "list") {
					if (left.v.length + right.v.length > MAX_COLLECTION_ITEMS) throw new RuntimeError("List size limit reached", line, col);
					return {
						t: "list",
						v: [...left.v, ...right.v]
					};
				}
				throw new RuntimeError("Cannot add these values", line, col);
			case "-":
			case "*":
			case "/":
			case "%": {
				const a = num(left, line, col);
				const b = num(right, line, col);
				if ((op === "/" || op === "%") && b.v === 0) throw new RuntimeError("Division by zero", line, col);
				if (op === "/" && a.t === "int" && b.t === "int") return {
					t: "int",
					v: Math.trunc(a.v / b.v)
				};
				const v = op === "-" ? a.v - b.v : op === "*" ? a.v * b.v : op === "/" ? a.v / b.v : a.v % b.v;
				if (op === "/") return {
					t: "float",
					v
				};
				return a.t === "float" || b.t === "float" ? {
					t: "float",
					v
				} : {
					t: "int",
					v
				};
			}
			default: throw new RuntimeError(`Unknown operator ${op}`, line, col);
		}
	};
	const evalCall = (expr, e) => {
		const callee = evalExpr(expr.callee, e);
		const args = expr.args.map((a) => evalExpr(a, e));
		if (callee.t === "native") try {
			return callee.impl(...args);
		} catch (err) {
			if (err instanceof RuntimeError) throw new RuntimeError(err.message, expr.loc.line, expr.loc.col);
			throw err;
		}
		if (callee.t !== "fn") throw new RuntimeError("Not a function", expr.loc.line, expr.loc.col);
		if (args.length !== callee.decl.params.length) throw new RuntimeError(`'${callee.name}' expected ${callee.decl.params.length} argument(s), got ${args.length}`, expr.loc.line, expr.loc.col);
		if (depth >= MAX_DEPTH) throw new RuntimeError("Maximum recursion depth exceeded", expr.loc.line, expr.loc.col);
		depth += 1;
		const local = new Env(env);
		callee.decl.params.forEach((p, i) => {
			local.declare(p.name, args[i], true, expr.loc.line, expr.loc.col);
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
	const assignTarget = (target, value, e) => {
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
				if (key.length > 1024) throw new RuntimeError("Map key too long", target.loc.line, target.loc.col);
				if (!obj.v.has(key) && obj.v.size >= MAX_COLLECTION_ITEMS) throw new RuntimeError("Map size limit reached", target.loc.line, target.loc.col);
				obj.v.set(key, value);
				return;
			}
		}
		if (target.kind === "member") {
			const obj = evalExpr(target.obj, e);
			if (obj.t !== "map") throw new RuntimeError("Cannot assign a field on this value", target.loc.line, target.loc.col);
			if (!obj.v.has(target.name) && obj.v.size >= MAX_COLLECTION_ITEMS) throw new RuntimeError("Struct field limit reached", target.loc.line, target.loc.col);
			obj.v.set(target.name, value);
			return;
		}
		throw new RuntimeError("Invalid assignment target", target.loc.line, target.loc.col);
	};
	const execStmt = (stmt, e) => {
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
			case "return": throw new ReturnSignal(stmt.value ? evalExpr(stmt.value, e) : { t: "null" });
			case "if":
				if (truthy(evalExpr(stmt.cond, e))) {
					execBlock(stmt.then, new Env(e));
					return;
				}
				for (const branch of stmt.elseIfs) if (truthy(evalExpr(branch.cond, e))) {
					execBlock(branch.body, new Env(e));
					return;
				}
				if (stmt.else) execBlock(stmt.else, new Env(e));
				return;
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
			case "while":
				while (truthy(evalExpr(stmt.cond, e))) execBlock(stmt.body, new Env(e));
				return;
		}
	};
	const execBlock = (body, e) => {
		for (const s of body) execStmt(s, e);
	};
	try {
		const fns = [];
		const stmts = [];
		for (const node of program.body) if (node.kind === "fn") {
			fns.push(node);
			env.declare(node.name, {
				t: "fn",
				name: node.name,
				decl: node
			}, false, node.loc.line, node.loc.col);
		} else if (node.kind === "type") types.set(node.name, node);
		else stmts.push(node);
		execBlock(stmts, env);
		let result = null;
		const main = env.values.get("main")?.value;
		if (main && main.t === "fn") try {
			result = evalCall({
				kind: "call",
				callee: {
					kind: "ident",
					name: "main",
					loc: main.decl.loc
				},
				args: [],
				loc: main.decl.loc
			}, env);
		} catch (err) {
			if (err instanceof ReturnSignal) result = err.value;
			else throw err;
		}
		return {
			ok: true,
			output,
			value: result && result.t !== "null" && result.t !== "fn" && result.t !== "native" ? display(result) : null,
			error: null
		};
	} catch (err) {
		if (err instanceof RuntimeError) return {
			ok: false,
			output,
			value: null,
			error: {
				message: err.message,
				line: err.line,
				col: err.col
			}
		};
		if (err instanceof ReturnSignal) return {
			ok: true,
			output,
			value: display(err.value),
			error: null
		};
		throw err;
	}
}
var ParseError = class extends Error {
	line;
	col;
	constructor(message, line, col) {
		super(message);
		this.line = line;
		this.col = col;
	}
};
function parse(source) {
	try {
		return {
			ok: true,
			program: new Parser(lex(source).filter((t) => t.kind !== "comment")).parseProgram(),
			errors: []
		};
	} catch (e) {
		if (e instanceof ParseError || e instanceof LexError) return {
			ok: false,
			program: null,
			errors: [{
				message: e.message,
				line: e.line,
				col: e.col
			}]
		};
		throw e;
	}
}
var Parser = class {
	i = 0;
	tokens;
	constructor(tokens) {
		this.tokens = tokens;
	}
	parseProgram() {
		const body = [];
		const loc = this.loc();
		while (!this.check("eof")) body.push(this.parseTop());
		return {
			kind: "program",
			body,
			loc
		};
	}
	parseTop() {
		if (this.check("fn")) return this.parseFn();
		if (this.check("type")) return this.parseTypeDecl();
		return this.parseStmt();
	}
	parseFn() {
		const loc = this.loc();
		this.eat("fn");
		const name = this.eat("ident").lexeme;
		this.eat("(");
		const params = [];
		if (!this.check(")")) {
			params.push(this.parseParam());
			while (this.match(",")) params.push(this.parseParam());
		}
		this.eat(")");
		let ret = null;
		if (this.match("->")) ret = this.parseTypeName();
		const body = this.parseBlock();
		return {
			kind: "fn",
			name,
			params,
			ret,
			body,
			loc
		};
	}
	parseTypeDecl() {
		const loc = this.loc();
		this.eat("type");
		const name = this.eat("ident").lexeme;
		this.eat("{");
		const fields = [];
		while (!this.check("}") && !this.check("eof")) {
			fields.push(this.parseParam());
			this.match(";");
			this.match(",");
		}
		this.eat("}");
		return {
			kind: "type",
			name,
			fields,
			loc
		};
	}
	parseParam() {
		const name = this.eat("ident").lexeme;
		let type = null;
		if (this.match(":")) type = this.parseTypeName();
		return {
			name,
			type
		};
	}
	parseTypeName() {
		if (this.check("ident")) return this.eat("ident").lexeme;
		throw this.err("Expected a type name");
	}
	parseStmt() {
		if (this.check("let") || this.check("const")) return this.parseLet();
		if (this.check("if")) return this.parseIf();
		if (this.check("for")) return this.parseFor();
		if (this.check("while")) return this.parseWhile();
		if (this.check("return")) {
			const loc = this.loc();
			this.eat("return");
			if (this.check("}") || this.check("eof") || this.check(";")) {
				this.match(";");
				return {
					kind: "return",
					value: null,
					loc
				};
			}
			const value = this.parseExpr();
			this.match(";");
			return {
				kind: "return",
				value,
				loc
			};
		}
		const loc = this.loc();
		const expr = this.parseExpr();
		if (this.match("=")) {
			const value = this.parseExpr();
			this.match(";");
			return {
				kind: "assign",
				target: expr,
				value,
				loc
			};
		}
		this.match(";");
		return {
			kind: "expr",
			expr,
			loc
		};
	}
	parseLet() {
		const loc = this.loc();
		const isConst = this.check("const");
		this.advance();
		const name = this.eat("ident").lexeme;
		let type = null;
		if (this.match(":")) type = this.parseTypeName();
		this.eat("=");
		const value = this.parseExpr();
		this.match(";");
		return {
			kind: "let",
			name,
			type,
			value,
			isConst,
			loc
		};
	}
	parseIf() {
		const loc = this.loc();
		this.eat("if");
		const cond = this.parseExpr();
		const then = this.parseBlock();
		const elseIfs = [];
		let els = null;
		while (this.match("else")) if (this.match("if")) {
			const eloc = this.prev().line ? {
				line: this.prev().line,
				col: this.prev().col
			} : this.loc();
			const c = this.parseExpr();
			const body = this.parseBlock();
			elseIfs.push({
				cond: c,
				body,
				loc: eloc
			});
		} else {
			els = this.parseBlock();
			break;
		}
		return {
			kind: "if",
			cond,
			then,
			elseIfs,
			else: els,
			loc
		};
	}
	parseFor() {
		const loc = this.loc();
		this.eat("for");
		const name = this.eat("ident").lexeme;
		this.eat("in");
		return {
			kind: "for",
			name,
			iter: this.parseExpr(),
			body: this.parseBlock(),
			loc
		};
	}
	parseWhile() {
		const loc = this.loc();
		this.eat("while");
		return {
			kind: "while",
			cond: this.parseExpr(),
			body: this.parseBlock(),
			loc
		};
	}
	parseBlock() {
		this.eat("{");
		const body = [];
		while (!this.check("}") && !this.check("eof")) {
			if (this.check("fn") || this.check("type")) throw this.err("Nested functions and types are not allowed");
			body.push(this.parseStmt());
		}
		this.eat("}");
		return body;
	}
	parseExpr() {
		return this.parseRange();
	}
	parseRange() {
		const left = this.parseOr();
		if (this.match("..")) {
			const loc = this.prevLoc();
			return {
				kind: "range",
				start: left,
				end: this.parseOr(),
				loc
			};
		}
		return left;
	}
	parseOr() {
		let left = this.parseAnd();
		while (this.match("or")) {
			const loc = this.prevLoc();
			const right = this.parseAnd();
			left = {
				kind: "binary",
				op: "or",
				left,
				right,
				loc
			};
		}
		return left;
	}
	parseAnd() {
		let left = this.parseNot();
		while (this.match("and")) {
			const loc = this.prevLoc();
			const right = this.parseNot();
			left = {
				kind: "binary",
				op: "and",
				left,
				right,
				loc
			};
		}
		return left;
	}
	parseNot() {
		if (this.match("not")) {
			const loc = this.prevLoc();
			return {
				kind: "unary",
				op: "not",
				expr: this.parseNot(),
				loc
			};
		}
		return this.parseCmp();
	}
	parseCmp() {
		let left = this.parseTerm();
		while (this.matchAny("==", "!=", "<", ">", "<=", ">=")) {
			const op = this.prev().lexeme;
			const loc = this.prevLoc();
			const right = this.parseTerm();
			left = {
				kind: "binary",
				op,
				left,
				right,
				loc
			};
		}
		return left;
	}
	parseTerm() {
		let left = this.parseFactor();
		while (this.matchAny("+", "-")) {
			const op = this.prev().lexeme;
			const loc = this.prevLoc();
			const right = this.parseFactor();
			left = {
				kind: "binary",
				op,
				left,
				right,
				loc
			};
		}
		return left;
	}
	parseFactor() {
		let left = this.parseUnary();
		while (this.matchAny("*", "/", "%")) {
			const op = this.prev().lexeme;
			const loc = this.prevLoc();
			const right = this.parseUnary();
			left = {
				kind: "binary",
				op,
				left,
				right,
				loc
			};
		}
		return left;
	}
	parseUnary() {
		if (this.match("-")) {
			const loc = this.prevLoc();
			return {
				kind: "unary",
				op: "-",
				expr: this.parseUnary(),
				loc
			};
		}
		return this.parsePostfix();
	}
	parsePostfix() {
		let expr = this.parsePrimary();
		for (;;) {
			if (this.match("(")) {
				const loc = this.prevLoc();
				const args = [];
				if (!this.check(")")) {
					args.push(this.parseExpr());
					while (this.match(",")) args.push(this.parseExpr());
				}
				this.eat(")");
				expr = {
					kind: "call",
					callee: expr,
					args,
					loc
				};
				continue;
			}
			if (this.match("[")) {
				const loc = this.prevLoc();
				const index = this.parseExpr();
				this.eat("]");
				expr = {
					kind: "index",
					obj: expr,
					index,
					loc
				};
				continue;
			}
			if (this.match(".")) {
				const loc = this.prevLoc();
				const name = this.eat("ident").lexeme;
				expr = {
					kind: "member",
					obj: expr,
					name,
					loc
				};
				continue;
			}
			break;
		}
		return expr;
	}
	parsePrimary() {
		const loc = this.loc();
		if (this.match("number")) {
			const t = this.prev();
			const raw = t.lexeme.includes(".") ? "float" : "int";
			return {
				kind: "literal",
				value: t.value,
				raw,
				loc
			};
		}
		if (this.match("string")) return {
			kind: "literal",
			value: this.prev().value,
			raw: "str",
			loc
		};
		if (this.match("true")) return {
			kind: "literal",
			value: true,
			raw: "bool",
			loc
		};
		if (this.match("false")) return {
			kind: "literal",
			value: false,
			raw: "bool",
			loc
		};
		if (this.match("null")) return {
			kind: "literal",
			value: null,
			raw: "null",
			loc
		};
		if (this.match("ident")) {
			const name = this.prev().lexeme;
			if (this.check("{") && this.looksLikeStruct()) {
				this.eat("{");
				const entries = this.parseEntries();
				this.eat("}");
				return {
					kind: "struct",
					name,
					entries,
					loc
				};
			}
			return {
				kind: "ident",
				name,
				loc
			};
		}
		if (this.match("[")) {
			const items = [];
			if (!this.check("]")) {
				items.push(this.parseExpr());
				while (this.match(",")) {
					if (this.check("]")) break;
					items.push(this.parseExpr());
				}
			}
			this.eat("]");
			return {
				kind: "list",
				items,
				loc
			};
		}
		if (this.match("{")) {
			const entries = this.parseEntries();
			this.eat("}");
			return {
				kind: "map",
				entries,
				loc
			};
		}
		if (this.match("(")) {
			const expr = this.parseExpr();
			this.eat(")");
			return expr;
		}
		throw this.err("Expected an expression");
	}
	looksLikeStruct() {
		const a = this.peek(1);
		const b = this.peek(2);
		if (!a) return false;
		if (a.kind === "}") return true;
		return a.kind === "ident" && b?.kind === ":";
	}
	parseEntries() {
		const entries = [];
		while (!this.check("}") && !this.check("eof")) {
			const key = this.check("ident") ? this.eat("ident").lexeme : this.check("string") ? String(this.eat("string").value) : (() => {
				throw this.err("Expected a field name");
			})();
			this.eat(":");
			const value = this.parseExpr();
			entries.push({
				key,
				value
			});
			this.match(",");
		}
		return entries;
	}
	peek(offset = 0) {
		return this.tokens[this.i + offset];
	}
	check(kind) {
		return this.peek()?.kind === kind;
	}
	match(kind) {
		if (this.check(kind)) {
			this.advance();
			return true;
		}
		return false;
	}
	matchAny(...kinds) {
		for (const k of kinds) if (this.match(k)) return true;
		return false;
	}
	advance() {
		const t = this.tokens[this.i];
		if (!t) throw this.err("Unexpected end of file");
		if (t.kind !== "eof") this.i += 1;
		return t;
	}
	prev() {
		return this.tokens[this.i - 1];
	}
	prevLoc() {
		const t = this.prev();
		return {
			line: t.line,
			col: t.col
		};
	}
	loc() {
		const t = this.peek() ?? this.prev();
		return {
			line: t.line,
			col: t.col
		};
	}
	eat(kind) {
		if (this.check(kind)) return this.advance();
		const t = this.peek();
		throw this.err(`Expected ${kind}, got ${t?.kind ?? "eof"}`);
	}
	err(message) {
		const t = this.peek();
		return new ParseError(message, t?.line ?? 1, t?.col ?? 1);
	}
};
function transpile(program, targetId) {
	return new Emitter(targetById(targetId)).emitProgram(program);
}
var Emitter = class {
	i = 0;
	lines = [];
	d;
	constructor(d) {
		this.d = d;
	}
	emitProgram(program) {
		const types = [];
		const fns = [];
		const stmts = [];
		for (const n of program.body) if (n.kind === "fn") fns.push(n);
		else if (n.kind === "type") types.push(n);
		else stmts.push(n);
		const hasMain = fns.some((f) => f.name === "main");
		const usesPrint = JSON.stringify(program).includes("\"name\":\"print\"");
		this.header(usesPrint);
		for (const t of types) this.emitType(t);
		for (const f of fns) {
			if (this.usesGeneratedEntryPoint() && f.name === "main") continue;
			this.emitFn(f);
		}
		const mainBody = hasMain ? fns.find((f) => f.name === "main").body : stmts;
		const extra = hasMain ? stmts : [];
		if (this.needsClassWrap()) {
			this.openMainClass();
			for (const f of fns) if (f.name !== "main") this.emitFn(f, true);
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
		} else if (this.d.family === "hs") this.emitHsMain(hasMain ? mainBody : stmts);
		else {
			for (const s of extra) this.emitStmt(s);
			if (!hasMain) for (const s of stmts) this.emitStmt(s);
			if (hasMain && this.d.id === "scala") this.write("@main def aetherEntry(): Unit = main();");
			else if (hasMain && this.shouldCallMain()) this.write(this.callMain());
		}
		this.footer(hasMain);
		return this.lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
	}
	pad() {
		return (this.d.family === "indent" || this.d.family === "hs" ? "    " : "  ").repeat(this.i);
	}
	write(s) {
		if (s.length === 0) {
			this.lines.push("");
			return;
		}
		for (const line of s.split("\n")) this.lines.push(line.length ? this.pad() + line : "");
	}
	semi() {
		return this.d.semi ? ";" : "";
	}
	header(usesPrint) {
		const c = this.d.comment;
		this.write(`${c} Generated from Aether`);
		switch (this.d.id) {
			case "go":
				this.write("package main");
				this.write("");
				if (usesPrint) this.write("import \"fmt\"");
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
			case "lua": break;
			case "haskell":
				this.write("module Main where");
				this.write("");
				break;
			case "rust": this.write("");
		}
	}
	footer(hasMain) {
		if (this.d.id === "python" && hasMain) {
			this.write("");
			this.write("if __name__ == \"__main__\":");
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
		if (this.d.id === "dart" && hasMain) {}
		if (this.d.id === "elixir" && hasMain) {
			this.write("");
			this.write("main()");
		}
	}
	needsClassWrap() {
		return this.d.id === "java" || this.d.id === "csharp";
	}
	usesGeneratedEntryPoint() {
		return this.needsClassWrap() || this.d.id === "go" || this.d.id === "c" || this.d.id === "cpp" || this.d.id === "rust" || this.d.id === "swift" || this.d.id === "haskell";
	}
	shouldCallMain() {
		return this.d.id === "javascript" || this.d.id === "typescript" || this.d.id === "php" || this.d.id === "scala";
	}
	callMain() {
		return `main()${this.semi()}`;
	}
	openMainClass() {
		if (this.d.id === "java") this.write("public class Aether {");
		if (this.d.id === "csharp") this.write("public class Aether {");
		this.i += 1;
	}
	closeMainClass() {
		this.i -= 1;
		this.write("}");
	}
	openMain() {
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
				this.write("func main() {");
				break;
			default: this.write("function main() {");
		}
		this.i += 1;
	}
	closeMain() {
		this.i -= 1;
		this.write("}");
		if (this.d.id === "c" || this.d.id === "cpp") {}
		if (this.d.id === "swift") this.write("main()");
	}
	mapType(t) {
		if (!t) return "";
		return {
			javascript: {
				int: "",
				float: "",
				str: "",
				bool: "",
				void: "",
				list: "",
				map: ""
			},
			typescript: {
				int: "number",
				float: "number",
				str: "string",
				bool: "boolean",
				void: "void",
				list: "any[]",
				map: "Record<string, any>"
			},
			python: {
				int: "int",
				float: "float",
				str: "str",
				bool: "bool",
				void: "None",
				list: "list",
				map: "dict"
			},
			go: {
				int: "int",
				float: "float64",
				str: "string",
				bool: "bool",
				void: "",
				list: "[]interface{}",
				map: "map[string]interface{}"
			},
			rust: {
				int: "i64",
				float: "f64",
				str: "String",
				bool: "bool",
				void: "()",
				list: "Vec<_>",
				map: "std::collections::HashMap<String, _>"
			},
			c: {
				int: "long",
				float: "double",
				str: "char*",
				bool: "int",
				void: "void",
				list: "void*",
				map: "void*"
			},
			cpp: {
				int: "long",
				float: "double",
				str: "string",
				bool: "bool",
				void: "void",
				list: "vector<auto>",
				map: "map<string, auto>"
			},
			java: {
				int: "int",
				float: "double",
				str: "String",
				bool: "boolean",
				void: "void",
				list: "List<Object>",
				map: "Map<String, Object>"
			},
			csharp: {
				int: "int",
				float: "double",
				str: "string",
				bool: "bool",
				void: "void",
				list: "List<object>",
				map: "Dictionary<string, object>"
			},
			ruby: {
				int: "",
				float: "",
				str: "",
				bool: "",
				void: "",
				list: "",
				map: ""
			},
			swift: {
				int: "Int",
				float: "Double",
				str: "String",
				bool: "Bool",
				void: "Void",
				list: "[Any]",
				map: "[String: Any]"
			},
			kotlin: {
				int: "Int",
				float: "Double",
				str: "String",
				bool: "Boolean",
				void: "Unit",
				list: "List<Any>",
				map: "Map<String, Any>"
			},
			php: {
				int: "int",
				float: "float",
				str: "string",
				bool: "bool",
				void: "void",
				list: "array",
				map: "array"
			},
			dart: {
				int: "int",
				float: "double",
				str: "String",
				bool: "bool",
				void: "void",
				list: "List",
				map: "Map"
			},
			lua: {
				int: "",
				float: "",
				str: "",
				bool: "",
				void: "",
				list: "",
				map: ""
			},
			scala: {
				int: "Int",
				float: "Double",
				str: "String",
				bool: "Boolean",
				void: "Unit",
				list: "List[Any]",
				map: "Map[String, Any]"
			},
			elixir: {
				int: "",
				float: "",
				str: "",
				bool: "",
				void: "",
				list: "",
				map: ""
			},
			haskell: {
				int: "Integer",
				float: "Double",
				str: "String",
				bool: "Bool",
				void: "()",
				list: "[a]",
				map: "[(String, a)]"
			}
		}[this.d.id]?.[t] ?? t;
	}
	emitType(t) {
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
	emitFn(fn, asStatic = false) {
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
	fnHead(name, params, ret, asStatic) {
		switch (this.d.id) {
			case "javascript": return `function ${name}(${params})`;
			case "typescript": return `function ${name}(${params})${ret ? `: ${ret}` : ""}`;
			case "python": return `def ${name}(${params})${ret ? ` -> ${ret}` : ""}`;
			case "go": return `func ${name}(${params})${ret ? ` ${ret}` : ""}`;
			case "rust": return `fn ${name}(${params})${ret && ret !== "()" ? ` -> ${ret}` : ""}`;
			case "c":
			case "cpp": return `${ret || "void"} ${name}(${params || "void"})`;
			case "java": return `static ${ret || "void"} ${name}(${params})`;
			case "csharp": return `static ${ret || "void"} ${name}(${params})`;
			case "ruby": return `def ${name}${params ? `(${params})` : ""}`;
			case "swift": return `func ${name}(${params})${ret ? ` -> ${ret}` : ""}`;
			case "kotlin": return `fun ${name}(${params})${ret && ret !== "Unit" ? `: ${ret}` : ""}`;
			case "php": return `function ${name}(${params})${ret ? `: ${ret}` : ""}`;
			case "dart": return `${ret || "void"} ${name}(${params})`;
			case "lua": return `function ${name}(${params})`;
			case "scala": return `def ${name}(${params})${ret ? `: ${ret}` : ""}`;
			case "elixir": return `def ${name}(${params})`;
			default: return `function ${name}(${params})`;
		}
	}
	param(name, type) {
		const t = this.mapType(type);
		switch (this.d.id) {
			case "javascript":
			case "ruby":
			case "lua":
			case "elixir":
			case "python": return this.d.id === "python" && t ? `${name}: ${t}` : name;
			case "typescript": return t ? `${name}: ${t}` : name;
			case "go": return t ? `${name} ${t}` : name;
			case "rust":
			case "swift":
			case "kotlin":
			case "scala":
			case "dart": return t ? `${this.d.id === "swift" ? `_ ${name}` : name}: ${t}` : name;
			case "php": return t ? `${t} $${name}` : `$${name}`;
			case "c":
			case "cpp":
			case "java":
			case "csharp": return `${t || "auto"} ${name}`;
			default: return name;
		}
	}
	openBlock(head) {
		if (this.d.family === "indent") {
			this.write(`${head}:`);
			this.i += 1;
			return;
		}
		if (this.d.family === "end") {
			const then = this.d.id === "elixir" ? " do" : this.d.id === "lua" && /^(if|elseif|while|for)\b/.test(head) ? " then" : "";
			this.write(`${head}${then}`);
			this.i += 1;
			return;
		}
		this.write(`${head} {`);
		this.i += 1;
	}
	closeBlock() {
		this.i -= 1;
		if (this.d.family === "indent" || this.d.family === "hs") return;
		if (this.d.family === "end") {
			this.write(this.d.endWord ?? "end");
			return;
		}
		this.write("}");
	}
	emitStmt(stmt) {
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
	emitLet(name, type, value, isConst) {
		const t = this.mapType(type);
		const n = this.ident(name);
		switch (this.d.id) {
			case "javascript": return `${isConst ? "const" : "let"} ${n} = ${value};`;
			case "typescript": return `${isConst ? "const" : "let"} ${n}${t ? `: ${t}` : ""} = ${value};`;
			case "python":
			case "ruby":
			case "lua":
			case "elixir": return `${n} = ${value}`;
			case "go": return `${n} := ${value}`;
			case "rust": return `${isConst ? "let" : "let mut"} ${n} = ${value};`;
			case "c": return `${t || "long"} ${n} = ${value};`;
			case "cpp": return `auto ${n} = ${value};`;
			case "java": return `${t || "var"} ${n} = ${value};`;
			case "csharp": return `${t || "var"} ${n} = ${value};`;
			case "swift": return `${isConst ? "let" : "var"} ${n} = ${value}`;
			case "kotlin": return `${isConst ? "val" : "var"} ${n} = ${value}`;
			case "php": return `${n} = ${value};`;
			case "dart": return `${isConst ? "final" : "var"} ${n} = ${value};`;
			case "scala": return `${isConst ? "val" : "var"} ${n} = ${value}`;
			default: return `${n} = ${value}${this.semi()}`;
		}
	}
	ident(name) {
		return this.d.id === "php" ? `$${name}` : name;
	}
	emitAssignTarget(expr) {
		return this.emitExpr(expr);
	}
	emitIf(stmt) {
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
	ifCond(expr) {
		const c = this.emitExpr(expr);
		return this.d.ifParens ? `(${c})` : c;
	}
	openIf(cond, _elif) {
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
	midIf(cond) {
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
	elseIf() {
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
	closeIf() {
		this.i -= 1;
		if (this.d.family === "indent") return;
		if (this.d.family === "end") {
			this.write(this.d.endWord ?? "end");
			return;
		}
		this.write("}");
	}
	emitFor(stmt) {
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
	openRangeFor(name, a, b) {
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
	openForIn(name, iter) {
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
			default: this.write(`for ${name} in ${iter} {`);
		}
		this.i += 1;
	}
	emitWhile(stmt) {
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
	closeLoop() {
		this.i -= 1;
		if (this.d.family === "indent") return;
		if (this.d.family === "end") {
			this.write(this.d.id === "elixir" ? "end)" : this.d.endWord ?? "end");
			return;
		}
		this.write("}");
	}
	emitExpr(expr) {
		switch (expr.kind) {
			case "literal": return this.emitLit(expr);
			case "ident": return this.ident(expr.name);
			case "binary": return this.emitBin(expr.op, this.emitExpr(expr.left), this.emitExpr(expr.right));
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
			case "call": return this.emitCall(expr);
			case "index": return this.emitIndex(this.emitExpr(expr.obj), this.emitExpr(expr.index));
			case "member": return this.emitMember(this.emitExpr(expr.obj), expr.name);
			case "list": return this.emitList(expr.items.map((x) => this.emitExpr(x)));
			case "map": return this.emitMap(expr.entries.map((e) => [e.key, this.emitExpr(e.value)]));
			case "struct": return this.emitStruct(expr.name, expr.entries.map((e) => [e.key, this.emitExpr(e.value)]));
			case "range": return this.emitRange(this.emitExpr(expr.start), this.emitExpr(expr.end));
		}
	}
	emitLit(expr) {
		if (expr.raw === "str") return this.quote(String(expr.value));
		if (expr.raw === "bool") {
			if (this.d.id === "python") return expr.value ? "True" : "False";
			if (this.d.id === "c") return expr.value ? "1" : "0";
			if (this.d.id === "haskell") return expr.value ? "True" : "False";
			if (this.d.id === "lua") return expr.value ? "true" : "false";
			if (this.d.id === "ruby") return expr.value ? "true" : "false";
			return expr.value ? "true" : "false";
		}
		if (expr.raw === "null") return {
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
			typescript: "null"
		}[this.d.id] ?? "null";
		return String(expr.value);
	}
	quote(s) {
		const q = JSON.stringify(s);
		if (this.d.id === "c") return q;
		return q;
	}
	emitBin(op, l, r) {
		if (op === "and") {
			if (this.d.id === "python" || this.d.id === "lua" || this.d.id === "haskell") return `(${l} and ${r})`;
			return `(${l} && ${r})`;
		}
		if (op === "or") {
			if (this.d.id === "python" || this.d.id === "lua" || this.d.id === "haskell") return `(${l} or ${r})`;
			return `(${l} || ${r})`;
		}
		if (op === "+" && this.d.id === "lua") {}
		if (op === "==" && this.d.id === "lua") return `(${l} == ${r})`;
		if (op === "!=" && this.d.id === "lua") return `(${l} ~= ${r})`;
		if (op === "!=" && this.d.id === "python") return `(${l} != ${r})`;
		if (op === "!=" && this.d.id === "haskell") return `(${l} /= ${r})`;
		if (op === "/" && this.d.id === "python") return "(" + l + " // " + r + ")";
		if (op === "%" && this.d.id === "lua") return `(${l} % ${r})`;
		return `(${l} ${op} ${r})`;
	}
	emitCall(expr) {
		const args = expr.args.map((a) => this.emitExpr(a));
		if (expr.callee.kind === "ident") {
			const n = expr.callee.name;
			if (n === "print") return this.emitPrint(args, expr.args);
			if (n === "str") return this.emitStr(args[0] ?? "\"\"");
			if (n === "len") return this.emitLen(args[0] ?? "0");
			if (n === "int") return this.emitIntCast(args[0] ?? "0");
			if (n === "float") return this.emitFloatCast(args[0] ?? "0");
			if (this.d.id === "php") return `${n}(${args.join(", ")})`;
			return `${n}(${args.join(", ")})`;
		}
		return `${this.emitExpr(expr.callee)}(${args.join(", ")})`;
	}
	emitPrint(args, sourceExprs) {
		const joined = args.join(", ");
		const spaceJoin = args.join(" + \" \" + ");
		switch (this.d.id) {
			case "javascript":
			case "typescript": return "console.log(" + joined + ")";
			case "python": return "print(" + joined + ")";
			case "go": return "fmt.Println(" + joined + ")";
			case "rust":
				if (args.length === 0) return "println!()";
				if (args.length === 1) return "println!(\"{}\", " + args[0] + ")";
				return "println!(\"{}\", vec![" + args.map((a) => "format!(\"{}\", " + a + ")").join(", ") + "].join(\" \"))";
			case "c":
				if (args.length === 1) return "printf(\"%s\\n\", " + args[0] + ")";
				return "printf(\"%s\\n\", " + joined + ")";
			case "cpp": return "cout " + args.map((a) => "<< " + a).join(" << \" \" ") + " << endl";
			case "java": return "System.out.println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
			case "csharp": return "Console.WriteLine(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
			case "ruby": return "puts " + joined;
			case "swift": return "print(" + joined + ")";
			case "kotlin": return "println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
			case "php": return "echo " + args.join(". \" \" . ") + ", \"\\n\"";
			case "dart": return "print(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
			case "lua": return "print(" + joined + ")";
			case "scala": return "println(" + (args.length === 1 ? args[0] : spaceJoin) + ")";
			case "elixir": return args.length === 1 ? "IO.puts(" + args[0] + ")" : "IO.puts(Enum.join([" + joined + "], \" \"))";
			case "haskell": {
				const rendered = args.map((a, index) => {
					const source = sourceExprs?.[index];
					return source?.kind === "literal" && source.raw === "str" ? a : `show ${a}`;
				});
				return rendered.length === 1 ? `putStrLn ${rendered[0] ?? "\"\""}` : `putStrLn (unwords [${rendered.join(", ")}])`;
			}
			default: return "print(" + joined + ")";
		}
	}
	emitStr(x) {
		switch (this.d.id) {
			case "javascript":
			case "typescript": return `String(${x})`;
			case "python": return `str(${x})`;
			case "go": return `fmt.Sprint(${x})`;
			case "rust": return `format!("{}", ${x})`;
			case "java": return `String.valueOf(${x})`;
			case "csharp": return `${x}.ToString()`;
			case "ruby": return `${x}.to_s`;
			case "swift": return `String(${x})`;
			case "kotlin": return `${x}.toString()`;
			case "php": return `(string) ${x}`;
			case "dart": return `${x}.toString()`;
			case "lua": return `tostring(${x})`;
			case "scala": return `${x}.toString`;
			case "elixir": return `to_string(${x})`;
			case "c": return `/* str */ ${x}`;
			case "cpp": return `to_string(${x})`;
			case "haskell": return `show ${x}`;
			default: return `str(${x})`;
		}
	}
	emitLen(x) {
		switch (this.d.id) {
			case "javascript":
			case "typescript":
			case "dart": return `${x}.length`;
			case "python":
			case "go": return `len(${x})`;
			case "rust": return `${x}.len()`;
			case "java": return `${x}.size()`;
			case "csharp": return `${x}.Count`;
			case "ruby": return `${x}.length`;
			case "swift": return `${x}.count`;
			case "kotlin": return `${x}.size`;
			case "php": return `count(${x})`;
			case "lua": return `#${x}`;
			case "scala": return `${x}.length`;
			case "elixir": return `length(${x})`;
			case "c": return `sizeof(${x})`;
			case "cpp": return `${x}.size()`;
			case "haskell": return `length ${x}`;
			default: return `len(${x})`;
		}
	}
	emitIntCast(x) {
		switch (this.d.id) {
			case "javascript":
			case "typescript": return `Number.parseInt(${x}, 10)`;
			case "python": return `int(${x})`;
			case "go": return `int(${x})`;
			case "rust": return `${x} as i64`;
			case "java": return `(int) ${x}`;
			case "c":
			case "cpp": return `(long) ${x}`;
			case "csharp": return `Convert.ToInt32(${x})`;
			default: return `int(${x})`;
		}
	}
	emitFloatCast(x) {
		switch (this.d.id) {
			case "javascript":
			case "typescript": return `Number(${x})`;
			case "python": return `float(${x})`;
			case "go": return `float64(${x})`;
			case "rust": return `${x} as f64`;
			default: return `float(${x})`;
		}
	}
	emitIndex(obj, i) {
		if (this.d.id === "lua") return `${obj}[(${i}) + 1]`;
		if (this.d.id === "haskell") return `(${obj} !! ${i})`;
		return `${obj}[${i}]`;
	}
	emitMember(obj, name) {
		if (this.d.id === "lua" || this.d.id === "elixir") return `${obj}.${name}`;
		if (this.d.id === "go") return `${obj}.${capitalize(name)}`;
		if (this.d.id === "python") return `${obj}["${name}"]`;
		if (this.d.id === "ruby") return `${obj}[:${name}]`;
		return `${obj}.${name}`;
	}
	emitList(items) {
		const inner = items.join(", ");
		switch (this.d.id) {
			case "go": return `[]interface{}{${inner}}`;
			case "rust": return `vec![${inner}]`;
			case "java": return `Arrays.asList(${inner})`;
			case "csharp": return `new List<object> { ${inner} }`;
			case "lua": return `{${inner}}`;
			case "scala": return `List(${inner})`;
			case "elixir": return `[${inner}]`;
			case "haskell": return `[${inner}]`;
			case "swift": return `[${inner}]`;
			case "php": return `[${inner}]`;
			default: return `[${inner}]`;
		}
	}
	emitMap(entries) {
		switch (this.d.id) {
			case "python": return `{${entries.map(([k, v]) => `"${k}": ${v}`).join(", ")}}`;
			case "javascript":
			case "typescript": return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
			case "go": return `map[string]interface{}{${entries.map(([k, v]) => `"${k}": ${v}`).join(", ")}}`;
			case "ruby": return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
			case "lua": return `{ ${entries.map(([k, v]) => `${k} = ${v}`).join(", ")} }`;
			case "php": return `[${entries.map(([k, v]) => `"${k}" => ${v}`).join(", ")}]`;
			case "elixir": return `%{${entries.map(([k, v]) => `${k}: ${v}`).join(", ")}}`;
			case "java": return `Map.of(${entries.flatMap(([k, v]) => [`"${k}"`, v]).join(", ")})`;
			default: return `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;
		}
	}
	emitStruct(name, entries) {
		switch (this.d.id) {
			case "python": return `${name}(${entries.map(([, v]) => v).join(", ")})`;
			case "go": return `${name}{${entries.map(([k, v]) => `${capitalize(k)}: ${v}`).join(", ")}}`;
			case "rust":
			case "swift":
			case "kotlin":
			case "scala": return `${name} { ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }`.replace(" { ", this.d.id === "kotlin" || this.d.id === "scala" ? "(" : " { ").replace(/ }$/, this.d.id === "kotlin" || this.d.id === "scala" ? ")" : " }");
			case "java": return `new ${name}() /* ${entries.map(([k, v]) => `${k}=${v}`).join(", ")} */`;
			case "haskell": return `${name} { ${entries.map(([k, v]) => `${k} = ${v}`).join(", ")} }`;
			default: return this.emitMap(entries);
		}
	}
	emitRange(a, b) {
		switch (this.d.id) {
			case "python": return `range(${a}, ${b})`;
			case "rust": return `${a}..${b}`;
			case "ruby": return `(${a}...${b})`;
			case "swift": return `${a}..<${b}`;
			case "kotlin": return `${a} until ${b}`;
			case "elixir": return `${a}..(${b} - 1)`;
			case "haskell": return `[${a}..(${b} - 1)]`;
			default: return `/* range ${a}..${b} */`;
		}
	}
	emitHsFn(fn) {
		const args = fn.params.map((p) => p.name).join(" ");
		const types = fn.params.map((p) => this.mapType(p.type) || "a").join(" -> ");
		const ret = this.mapType(fn.ret) || "()";
		const sig = fn.params.length ? `${fn.name} :: ${types} -> ${ret}` : `${fn.name} :: ${ret}`;
		this.write(sig);
		if (fn.body.length === 1 && fn.body[0].kind === "return" && fn.body[0].value) {
			this.write(`${fn.name} ${args} = ${this.emitExpr(fn.body[0].value)}`);
			this.write("");
			return;
		}
		this.write(`${fn.name} ${args} =`);
		this.i += 1;
		this.emitHsStmts(fn.body);
		this.i -= 1;
		this.write("");
	}
	emitHsMain(body) {
		this.write("main :: IO ()");
		this.write("main = do");
		this.i += 1;
		if (body.length === 0) this.write("return ()");
		else this.emitHsStmts(body);
		this.i -= 1;
	}
	emitHsStmts(body) {
		for (const s of body) if (s.kind === "expr") this.write(this.emitExpr(s.expr));
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
		} else this.write(`${this.d.comment} ${s.kind}`);
	}
	hsInline(s) {
		if (s.kind === "expr") return this.emitExpr(s.expr);
		if (s.kind === "return" && s.value) return this.emitExpr(s.value);
		return "return ()";
	}
};
function capitalize(s) {
	return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
function run(source) {
	const result = parse(source);
	if (!result.ok) return {
		ok: false,
		output: [],
		value: null,
		error: result.errors[0]
	};
	return interpret(result.program);
}
function emit(source, target) {
	const result = parse(source);
	if (!result.ok) return {
		ok: false,
		errors: result.errors,
		code: ""
	};
	return {
		ok: true,
		code: transpile(result.program, target)
	};
}
//#endregion
export { run as n, emit as t };
