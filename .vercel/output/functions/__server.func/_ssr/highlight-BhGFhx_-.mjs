import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/highlight-BhGFhx_-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function AetherMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: cn("text-accent", className),
		fill: "none",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M16 3.5 L28.5 26.5 H3.5 Z",
			stroke: "currentColor",
			strokeWidth: "1.4",
			strokeLinejoin: "miter"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M8.2 17.2 H23.8",
			stroke: "currentColor",
			strokeWidth: "1.4"
		})]
	});
}
var STR = {
	tr: {
		name: "Aether",
		tagline: "Bir dil. Bütün diller.",
		lead: "Aether, modern dillerin ortak paydasından doğan evrensel bir sözdizimidir. Bir kez yazın; on sekiz dile çevirin — ya da doğrudan çalıştırın.",
		playground: "Açık alan",
		learn: "Sözdizimi",
		run: "Çalıştır",
		running: "Çalışıyor",
		reset: "Sıfırla",
		copy: "Kopyala",
		copied: "Kopyalandı",
		examples: "Örnekler",
		source: "Aether",
		output: "Çeviri",
		console: "Konsol",
		target: "Hedef dil",
		emptyConsole: "Çıktı burada görünür. Çalıştır’a basın.",
		result: "Sonuç",
		err: "Hata",
		line: "satır",
		shortcut: "Ctrl Enter ile çalıştır",
		principle1t: "Ortak payda",
		principle1: "fn, let, if, for — tanıdığınız dillerin kesişimi. Yeni bir ideoloji değil, bir köprü.",
		principle2t: "Gerçek çalışma",
		principle2: "Kaynak ayrıştırılır, yorumlanır, çalışır. Konsoldaki satırlar üretilmiş değil, hesaplanmıştır.",
		principle3t: "On sekiz hedef",
		principle3: "Aynı program JavaScript, Python, Go, Rust, C, Java ve diğerlerinde kendi deyişiyle durur.",
		ctaPlay: "Açık alanda yaz",
		ctaLearn: "Sözdizimini oku",
		footer: "Aether, dillerin üstünde duran bir katmandır — onları değiştirmez, çevirir.",
		chapter: "Bölüm",
		tryIt: "Açık alanda dene",
		next: "Sonraki",
		langNative: "Aether",
		openPlay: "Açık alan"
	},
	en: {
		name: "Aether",
		tagline: "One language. Every language.",
		lead: "Aether is a universal syntax drawn from the common ground of modern languages. Write once, emit into eighteen targets — or run it here.",
		playground: "Playground",
		learn: "Syntax",
		run: "Run",
		running: "Running",
		reset: "Reset",
		copy: "Copy",
		copied: "Copied",
		examples: "Examples",
		source: "Aether",
		output: "Translation",
		console: "Console",
		target: "Target language",
		emptyConsole: "Output appears here. Press Run.",
		result: "Result",
		err: "Error",
		line: "line",
		shortcut: "Run with Ctrl Enter",
		principle1t: "Common ground",
		principle1: "fn, let, if, for — the intersection of languages you already know. Not a new ideology. A bridge.",
		principle2t: "It actually runs",
		principle2: "Source is parsed, interpreted, executed. Console lines are computed, not faked.",
		principle3t: "Eighteen targets",
		principle3: "The same program stands in JavaScript, Python, Go, Rust, C, Java and the rest, in each language’s own idiom.",
		ctaPlay: "Write in the playground",
		ctaLearn: "Read the syntax",
		footer: "Aether sits above languages — it does not replace them. It translates.",
		chapter: "Chapter",
		tryIt: "Try in the playground",
		next: "Next",
		langNative: "Aether",
		openPlay: "Playground"
	}
};
var useLocale = create((set) => ({
	locale: "tr",
	setLocale: (locale) => {
		set({ locale });
		try {
			localStorage.setItem("aether-locale", locale);
		} catch {}
	}
}));
function hydrateLocale() {
	try {
		const saved = localStorage.getItem("aether-locale");
		if (saved === "tr" || saved === "en") useLocale.getState().setLocale(saved);
	} catch {}
}
function useCopy() {
	return STR[useLocale((s) => s.locale)];
}
function AppShell({ children, dense = false }) {
	const t = useCopy();
	const locale = useLocale((s) => s.locale);
	const setLocale = useLocale((s) => s.setLocale);
	const path = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		hydrateLocale();
	}, []);
	const nav = [
		{
			to: "/",
			label: t.name,
			match: "/"
		},
		{
			to: "/playground",
			label: t.playground,
			match: "/playground"
		},
		{
			to: "/learn",
			label: t.learn,
			match: "/learn"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2.5 text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AetherMark, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg italic tracking-tight",
						children: "Aether"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex items-center gap-1 sm:gap-2",
					children: [nav.slice(1).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: cn("flex h-11 items-center px-2.5 text-sm sm:px-3", path === item.match ? "text-fg" : "text-muted hover:text-fg"),
						children: item.label
					}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-1 flex h-9 items-center rounded-sm border border-border p-0.5",
						children: ["tr", "en"].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLocale(l),
							className: cn("h-8 min-w-9 px-2 text-xs uppercase tracking-wide", locale === l ? "bg-elevated text-fg" : "text-muted hover:text-fg"),
							"aria-pressed": locale === l,
							children: l
						}, l))
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex flex-1 flex-col", dense ? "min-h-0 overflow-hidden" : ""),
			children
		})]
	});
}
function CodePane({ value, onChange, html, readOnly, label, className }) {
	const preRef = (0, import_react.useRef)(null);
	const taRef = (0, import_react.useRef)(null);
	const gutterRef = (0, import_react.useRef)(null);
	const lines = value.length === 0 ? 1 : value.split("\n").length;
	const sync = () => {
		const src = readOnly ? preRef.current : taRef.current;
		const pre = preRef.current;
		const gutter = gutterRef.current;
		if (!src) return;
		if (pre && pre !== src) {
			pre.scrollTop = src.scrollTop;
			pre.scrollLeft = src.scrollLeft;
		}
		if (gutter) gutter.scrollTop = src.scrollTop;
	};
	(0, import_react.useEffect)(() => {
		sync();
	}, [value, html]);
	const onKeyDown = (e) => {
		if (e.key !== "Tab" || !onChange) return;
		e.preventDefault();
		const el = e.currentTarget;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		onChange(value.slice(0, start) + "  " + value.slice(end));
		requestAnimationFrame(() => {
			el.selectionStart = el.selectionEnd = start + 2;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex min-h-0 min-w-0 flex-1 flex-col bg-surface", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				ref: gutterRef,
				className: "select-none overflow-hidden border-r border-border bg-bg py-3 pr-2 pl-3 font-mono text-xs leading-6 text-subtle tabular-nums",
				children: Array.from({ length: lines }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-right",
					children: i + 1
				}, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					ref: preRef,
					onScroll: sync,
					className: cn("absolute inset-0 overflow-auto px-3 py-3 font-mono text-xs leading-6 whitespace-pre sm:text-sm", readOnly ? "" : "pointer-events-none"),
					dangerouslySetInnerHTML: { __html: html || " " }
				}), readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: label
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					ref: taRef,
					value,
					onChange: (e) => onChange?.(e.target.value),
					onScroll: sync,
					onKeyDown,
					spellCheck: false,
					autoCapitalize: "off",
					autoCorrect: "off",
					"aria-label": label,
					className: "absolute inset-0 resize-none overflow-auto bg-transparent px-3 py-3 font-mono text-xs leading-6 text-transparent caret-accent outline-none sm:text-sm"
				})]
			})]
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			ghost: "text-fg hover:bg-elevated",
			outline: "border border-border text-fg hover:bg-elevated",
			muted: "bg-elevated text-fg hover:bg-border"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var KEYWORDS = {
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
	not: "not"
};
function lex(source) {
	const tokens = [];
	let i = 0;
	let line = 1;
	let col = 1;
	const n = source.length;
	const push = (kind, lexeme, pos, l, c) => {
		tokens.push({
			kind,
			lexeme,
			pos,
			line: l,
			col: c
		});
	};
	while (i < n) {
		const c = source[i];
		if (c === " " || c === "	" || c === "\r") {
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
		if (c === "#" || c === "/" && source[i + 1] === "/") {
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
		if (c === "\"") {
			const start = i;
			const sl = line;
			const sc = col;
			i += 1;
			col += 1;
			let out = "";
			while (i < n && source[i] !== "\"") {
				if (source[i] === "\n") throw lexError("Unterminated string", sl, sc);
				if (source[i] === "\\") {
					const nch = source[i + 1];
					const map = {
						n: "\n",
						t: "	",
						r: "\r",
						"\"": "\"",
						"\\": "\\"
					};
					if (!nch || map[nch] === void 0) throw lexError("Invalid escape", line, col);
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
				col: sc
			});
			continue;
		}
		if (isDigit(c) || c === "." && isDigit(source[i + 1] ?? "")) {
			const start = i;
			const sl = line;
			const sc = col;
			let sawDot = false;
			if (c === ".") {
				sawDot = true;
				i += 1;
				col += 1;
			}
			while (i < n && isDigit(source[i])) {
				i += 1;
				col += 1;
			}
			if (!sawDot && source[i] === "." && source[i + 1] !== "." && isDigit(source[i + 1] ?? "")) {
				sawDot = true;
				i += 1;
				col += 1;
				while (i < n && isDigit(source[i])) {
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
				col: sc
			});
			continue;
		}
		if (isIdentStart(c)) {
			const start = i;
			const sl = line;
			const sc = col;
			i += 1;
			col += 1;
			while (i < n && isIdentPart(source[i])) {
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
var TWO = {
	"->": "->",
	"..": "..",
	"==": "==",
	"!=": "!=",
	"<=": "<=",
	">=": ">="
};
var ONE = {
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
	";": ";"
};
function isDigit(c) {
	return c >= "0" && c <= "9";
}
function isIdentStart(c) {
	return c >= "A" && c <= "Z" || c >= "a" && c <= "z" || c === "_";
}
function isIdentPart(c) {
	return isIdentStart(c) || isDigit(c);
}
var LexError = class extends Error {
	line;
	col;
	constructor(message, line, col) {
		super(message);
		this.line = line;
		this.col = col;
	}
};
function lexError(message, line, col) {
	return new LexError(message, line, col);
}
var TARGETS = [
	{
		id: "javascript",
		name: "JavaScript",
		ext: "js",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#c5d0cc"
	},
	{
		id: "typescript",
		name: "TypeScript",
		ext: "ts",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#a8b4c4"
	},
	{
		id: "python",
		name: "Python",
		ext: "py",
		family: "indent",
		ifParens: false,
		semi: false,
		elif: "elif",
		thenWord: null,
		endWord: null,
		comment: "#",
		color: "#d4c4a8"
	},
	{
		id: "go",
		name: "Go",
		ext: "go",
		family: "brace",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#7aa0b8"
	},
	{
		id: "rust",
		name: "Rust",
		ext: "rs",
		family: "brace",
		ifParens: false,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#c4a090"
	},
	{
		id: "c",
		name: "C",
		ext: "c",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#a0a8b0"
	},
	{
		id: "cpp",
		name: "C++",
		ext: "cpp",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#8aa4c0"
	},
	{
		id: "java",
		name: "Java",
		ext: "java",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#c4b090"
	},
	{
		id: "csharp",
		name: "C#",
		ext: "cs",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#9aa88c"
	},
	{
		id: "ruby",
		name: "Ruby",
		ext: "rb",
		family: "end",
		ifParens: false,
		semi: false,
		elif: "elsif",
		thenWord: null,
		endWord: "end",
		comment: "#",
		color: "#c09090"
	},
	{
		id: "swift",
		name: "Swift",
		ext: "swift",
		family: "brace",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#d0b090"
	},
	{
		id: "kotlin",
		name: "Kotlin",
		ext: "kt",
		family: "brace",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#b0a4c4"
	},
	{
		id: "php",
		name: "PHP",
		ext: "php",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "elseif",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#a4a0c0"
	},
	{
		id: "dart",
		name: "Dart",
		ext: "dart",
		family: "brace",
		ifParens: true,
		semi: true,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#90b0c4"
	},
	{
		id: "lua",
		name: "Lua",
		ext: "lua",
		family: "end",
		ifParens: false,
		semi: false,
		elif: "elseif",
		thenWord: "then",
		endWord: "end",
		comment: "--",
		color: "#90a4c0"
	},
	{
		id: "scala",
		name: "Scala",
		ext: "scala",
		family: "brace",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: null,
		endWord: null,
		comment: "//",
		color: "#c49090"
	},
	{
		id: "elixir",
		name: "Elixir",
		ext: "ex",
		family: "end",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: "do",
		endWord: "end",
		comment: "#",
		color: "#a090c0"
	},
	{
		id: "haskell",
		name: "Haskell",
		ext: "hs",
		family: "hs",
		ifParens: false,
		semi: false,
		elif: "else if",
		thenWord: "then",
		endWord: null,
		comment: "--",
		color: "#90b09c"
	}
];
function targetById(id) {
	return TARGETS.find((t) => t.id === id) ?? TARGETS[0];
}
var TYPES = /* @__PURE__ */ new Set([
	"int",
	"float",
	"str",
	"bool",
	"list",
	"map",
	"void"
]);
var KW = /* @__PURE__ */ new Set([
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
	"not"
]);
function esc(s) {
	return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
function cls(tok, next) {
	if (tok.kind === "comment") return "tok-comment";
	if (tok.kind === "string") return "tok-str";
	if (tok.kind === "number") return "tok-num";
	if (KW.has(tok.kind) || KW.has(tok.lexeme)) return "tok-kw";
	if (tok.kind === "ident" && TYPES.has(tok.lexeme)) return "tok-type";
	if (tok.kind === "ident" && next?.kind === "(") return "tok-fn";
	if (tok.kind === "ident") return "tok-ident";
	return "tok-punct";
}
function highlightAether(source) {
	let tokens;
	try {
		tokens = lex(source);
	} catch {
		return esc(source);
	}
	let html = "";
	let i = 0;
	for (let k = 0; k < tokens.length; k++) {
		const t = tokens[k];
		if (t.kind === "eof") break;
		if (t.pos > i) html += esc(source.slice(i, t.pos));
		const next = tokens[k + 1];
		html += `<span class="${cls(t, next)}">${esc(t.lexeme)}</span>`;
		i = t.pos + t.lexeme.length;
	}
	if (i < source.length) html += esc(source.slice(i));
	return html;
}
var LANG_KW = {
	javascript: [
		"function",
		"const",
		"let",
		"var",
		"if",
		"else",
		"for",
		"while",
		"return",
		"of",
		"in",
		"true",
		"false",
		"null",
		"class",
		"new"
	],
	typescript: [
		"function",
		"const",
		"let",
		"var",
		"if",
		"else",
		"for",
		"while",
		"return",
		"of",
		"in",
		"true",
		"false",
		"null",
		"type",
		"interface",
		"number",
		"string",
		"boolean",
		"void"
	],
	python: [
		"def",
		"if",
		"elif",
		"else",
		"for",
		"while",
		"return",
		"in",
		"and",
		"or",
		"not",
		"True",
		"False",
		"None",
		"class",
		"import",
		"from",
		"as"
	],
	go: [
		"package",
		"import",
		"func",
		"if",
		"else",
		"for",
		"return",
		"var",
		"type",
		"struct",
		"range",
		"true",
		"false",
		"nil"
	],
	rust: [
		"fn",
		"let",
		"mut",
		"if",
		"else",
		"for",
		"in",
		"while",
		"return",
		"struct",
		"true",
		"false",
		"vec"
	],
	c: [
		"int",
		"long",
		"double",
		"char",
		"void",
		"if",
		"else",
		"for",
		"while",
		"return",
		"include",
		"printf"
	],
	cpp: [
		"int",
		"long",
		"double",
		"void",
		"if",
		"else",
		"for",
		"while",
		"return",
		"using",
		"namespace",
		"auto",
		"include",
		"string",
		"cout",
		"endl"
	],
	java: [
		"public",
		"static",
		"class",
		"void",
		"int",
		"double",
		"String",
		"if",
		"else",
		"for",
		"while",
		"return",
		"import",
		"new",
		"var",
		"true",
		"false",
		"null"
	],
	csharp: [
		"using",
		"public",
		"static",
		"class",
		"void",
		"int",
		"double",
		"string",
		"var",
		"if",
		"else",
		"for",
		"foreach",
		"while",
		"return",
		"true",
		"false",
		"null",
		"new"
	],
	ruby: [
		"def",
		"end",
		"if",
		"elsif",
		"else",
		"do",
		"each",
		"true",
		"false",
		"nil",
		"return",
		"puts"
	],
	swift: [
		"func",
		"let",
		"var",
		"if",
		"else",
		"for",
		"in",
		"while",
		"return",
		"struct",
		"true",
		"false",
		"nil",
		"print"
	],
	kotlin: [
		"fun",
		"val",
		"var",
		"if",
		"else",
		"for",
		"in",
		"until",
		"while",
		"return",
		"data",
		"class",
		"true",
		"false",
		"null"
	],
	php: [
		"function",
		"if",
		"elseif",
		"else",
		"for",
		"foreach",
		"while",
		"return",
		"echo",
		"true",
		"false",
		"null",
		"as"
	],
	dart: [
		"void",
		"int",
		"var",
		"final",
		"if",
		"else",
		"for",
		"in",
		"while",
		"return",
		"true",
		"false",
		"null",
		"print"
	],
	lua: [
		"function",
		"end",
		"if",
		"then",
		"elseif",
		"else",
		"for",
		"do",
		"while",
		"return",
		"true",
		"false",
		"nil",
		"local",
		"in",
		"ipairs"
	],
	scala: [
		"def",
		"val",
		"var",
		"if",
		"else",
		"for",
		"until",
		"while",
		"return",
		"case",
		"class",
		"true",
		"false",
		"null"
	],
	elixir: [
		"def",
		"do",
		"end",
		"if",
		"else",
		"fn",
		"true",
		"false",
		"nil"
	],
	haskell: [
		"module",
		"where",
		"main",
		"if",
		"then",
		"else",
		"do",
		"let",
		"True",
		"False",
		"data"
	]
};
function highlightTarget(source, id) {
	const kws = new Set(LANG_KW[id] ?? []);
	const comment = TARGETS.find((t) => t.id === id)?.comment ?? "//";
	let html = "";
	let i = 0;
	const n = source.length;
	const take = (end, clsName) => {
		html += `<span class="${clsName}">${esc(source.slice(i, end))}</span>`;
		i = end;
	};
	while (i < n) {
		if (source.startsWith(comment, i)) {
			let e = source.indexOf("\n", i);
			if (e < 0) e = n;
			take(e, "tok-comment");
			continue;
		}
		const c = source[i];
		if (c === "\"" || c === "'") {
			const q = c;
			let j = i + 1;
			while (j < n && source[j] !== q) if (source[j] === "\\") j += 2;
			else j += 1;
			take(Math.min(j + 1, n), "tok-str");
			continue;
		}
		if (c >= "0" && c <= "9") {
			let j = i;
			while (j < n && /[0-9.]/.test(source[j])) j += 1;
			take(j, "tok-num");
			continue;
		}
		if (/[A-Za-z_]/.test(c)) {
			let j = i;
			while (j < n && /[A-Za-z0-9_]/.test(source[j])) j += 1;
			const word = source.slice(i, j);
			take(j, kws.has(word) ? "tok-kw" : "tok-ident");
			continue;
		}
		html += esc(c);
		i += 1;
	}
	return html;
}
//#endregion
export { LexError as a, highlightAether as c, targetById as d, useCopy as f, CodePane as i, highlightTarget as l, AppShell as n, TARGETS as o, useLocale as p, Button as r, cn as s, AetherMark as t, lex as u };
