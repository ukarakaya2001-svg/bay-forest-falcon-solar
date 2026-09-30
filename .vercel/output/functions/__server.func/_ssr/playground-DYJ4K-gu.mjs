import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as highlightAether, f as useCopy, i as CodePane, l as highlightTarget, n as AppShell, o as TARGETS, p as useLocale, r as Button, s as cn } from "./highlight-BhGFhx_-.mjs";
import { a as Check, i as Copy, n as RotateCcw, r as Play } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-DMhwwpuf.mjs";
import { n as run, t as emit } from "./aether-D2AFMzg8.mjs";
import { n as pn, r as yn, t as bn } from "../_libs/react-resizable-panels.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/playground-DYJ4K-gu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EXAMPLES = [
	{
		id: "hello",
		title: {
			tr: "Merhaba",
			en: "Hello"
		},
		blurb: {
			tr: "İlk program. print evrensel çıktıdır.",
			en: "The first program. print is the universal output."
		},
		code: `fn main() {
  print("Hello, Aether")
}
`
	},
	{
		id: "fizzbuzz",
		title: {
			tr: "FizzBuzz",
			en: "FizzBuzz"
		},
		blurb: {
			tr: "Koşullar, döngüler ve kalan.",
			en: "Conditions, loops, and remainder."
		},
		code: `fn main() {
  for i in 1..16 {
    if i % 15 == 0 {
      print("FizzBuzz")
    } else if i % 3 == 0 {
      print("Fizz")
    } else if i % 5 == 0 {
      print("Buzz")
    } else {
      print(i)
    }
  }
}
`
	},
	{
		id: "fib",
		title: {
			tr: "Fibonacci",
			en: "Fibonacci"
		},
		blurb: {
			tr: "Özyineleme. Her dilin bildiği bir ritim.",
			en: "Recursion. A rhythm every language knows."
		},
		code: `fn fib(n: int) -> int {
  if n <= 1 {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

fn main() {
  for i in 0..10 {
    print("fib(" + str(i) + ") = " + str(fib(i)))
  }
}
`
	},
	{
		id: "factorial",
		title: {
			tr: "Faktöriyel",
			en: "Factorial"
		},
		blurb: {
			tr: "Klasik özyinelemeli tanım.",
			en: "The classic recursive definition."
		},
		code: `fn fact(n: int) -> int {
  if n <= 1 {
    return 1
  }
  return n * fact(n - 1)
}

fn main() {
  print(fact(6))
}
`
	},
	{
		id: "lists",
		title: {
			tr: "Listeler",
			en: "Lists"
		},
		blurb: {
			tr: "Toplama, dizin ve birleştirme.",
			en: "Sums, indexes, and concatenation."
		},
		code: `fn sum(xs: list) -> int {
  let total = 0
  for x in xs {
    total = total + x
  }
  return total
}

fn main() {
  let nums = [3, 1, 4, 1, 5]
  print("len", len(nums))
  print("first", nums[0])
  print("sum", sum(nums))
  print(nums + [9])
}
`
	},
	{
		id: "person",
		title: {
			tr: "Kayıt türü",
			en: "Record type"
		},
		blurb: {
			tr: "type ile yapı, alan okuma.",
			en: "Structs with type, then field access."
		},
		code: `type Person {
  name: str
  year: int
}

fn greet(p: Person) -> str {
  return "Ada was born in " + str(p.year)
}

fn main() {
  let ada = Person { name: "Ada Lovelace", year: 1815 }
  print(ada.name)
  print(greet(ada))
}
`
	},
	{
		id: "collatz",
		title: {
			tr: "Collatz",
			en: "Collatz"
		},
		blurb: {
			tr: "while, çift/tek, bir tahmine kadar.",
			en: "while, even/odd, down to one."
		},
		code: `fn collatz(n: int) -> int {
  let steps = 0
  while n != 1 {
    if n % 2 == 0 {
      n = n / 2
    } else {
      n = 3 * n + 1
    }
    steps = steps + 1
  }
  return steps
}

fn main() {
  print("27 takes", collatz(27), "steps")
}
`
	},
	{
		id: "primes",
		title: {
			tr: "Asallar",
			en: "Primes"
		},
		blurb: {
			tr: "İç içe döngü ve bir eleğin iskeleti.",
			en: "Nested loops and the skeleton of a sieve."
		},
		code: `fn is_prime(n: int) -> bool {
  if n < 2 {
    return false
  }
  for d in 2..n {
    if n % d == 0 {
      return false
    }
  }
  return true
}

fn main() {
  for n in 2..30 {
    if is_prime(n) {
      print(n)
    }
  }
}
`
	},
	{
		id: "palindrome",
		title: {
			tr: "Palindrom",
			en: "Palindrome"
		},
		blurb: {
			tr: "Metin, dizin, karşılaştırma.",
			en: "Strings, indexes, comparison."
		},
		code: `fn palindrome(s: str) -> bool {
  let i = 0
  let j = len(s) - 1
  while i < j {
    if s[i] != s[j] {
      return false
    }
    i = i + 1
    j = j - 1
  }
  return true
}

fn main() {
  print(palindrome("kayak"))
  print(palindrome("aether"))
}
`
	}
];
var DEFAULT_SOURCE = EXAMPLES[1].code;
var STORAGE_KEY = "aether-source";
var TARGET_KEY = "aether-target";
function PlaygroundView({ initialSource, initialTarget }) {
	const t = useCopy();
	const locale = useLocale((s) => s.locale);
	const [source, setSource] = (0, import_react.useState)(initialSource ?? DEFAULT_SOURCE);
	const [target, setTarget] = (0, import_react.useState)(initialTarget ?? "python");
	const [pane, setPane] = (0, import_react.useState)("source");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [examplesOpen, setExamplesOpen] = (0, import_react.useState)(false);
	const [consoleState, setConsoleState] = (0, import_react.useState)({
		output: [],
		value: null,
		error: null
	});
	(0, import_react.useEffect)(() => {
		if (initialSource) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			const savedT = localStorage.getItem(TARGET_KEY);
			if (saved) setSource(saved);
			if (savedT && TARGETS.some((x) => x.id === savedT)) setTarget(savedT);
		} catch {}
	}, [initialSource]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEY, source);
			localStorage.setItem(TARGET_KEY, target);
		} catch {}
	}, [source, target]);
	const sourceHtml = (0, import_react.useMemo)(() => highlightAether(source), [source]);
	const emitted = (0, import_react.useMemo)(() => emit(source, target), [source, target]);
	const emitHtml = (0, import_react.useMemo)(() => highlightTarget(emitted.ok ? emitted.code : emitted.errors.map((e) => e.message).join("\n"), target), [emitted, target]);
	const onRun = (0, import_react.useCallback)(() => {
		const result = run(source);
		if (result.ok) setConsoleState({
			output: result.output,
			value: result.value,
			error: null
		});
		else setConsoleState({
			output: result.output,
			value: null,
			error: result.error
		});
		setPane("console");
	}, [source]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				onRun();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onRun]);
	const copyOut = async () => {
		const text = emitted.ok ? emitted.code : "";
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1200);
		} catch {}
	};
	const loadExample = (id) => {
		const ex = EXAMPLES.find((e) => e.id === id);
		if (!ex) return;
		setSource(ex.code);
		setExamplesOpen(false);
		setConsoleState({
			output: [],
			value: null,
			error: null
		});
	};
	const consoleText = consoleState.error ? `${t.err} (${t.line} ${consoleState.error.line}:${consoleState.error.col})\n${consoleState.error.message}` : consoleState.output.length === 0 && !consoleState.value ? t.emptyConsole : [...consoleState.output, consoleState.value ? `${t.result}: ${consoleState.value}` : ""].filter(Boolean).join("\n");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setExamplesOpen((v) => !v),
							children: t.examples
						}), examplesOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-full left-0 z-20 mt-1 w-64 rounded-md border border-border bg-elevated p-1 shadow-[var(--shadow-border)]",
							children: EXAMPLES.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => loadExample(ex.id),
								className: "flex w-full flex-col items-start rounded-xs px-3 py-2 text-left hover:bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-fg",
									children: ex.title[locale]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted",
									children: ex.blurb[locale]
								})]
							}, ex.id))
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: onRun,
						className: "pl-3.5 pr-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-px size-3.5 fill-current" }), t.run]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							setSource(DEFAULT_SOURCE);
							setConsoleState({
								output: [],
								value: null,
								error: null
							});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: t.reset
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: copyOut,
						children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: copied ? t.copied : t.copy
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto hidden text-xs text-subtle sm:inline",
						children: t.shortcut
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto border-b border-border px-3 py-2 sm:px-4",
				children: TARGETS.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTarget(lang.id),
					className: cn("h-9 shrink-0 rounded-sm px-3 text-xs tracking-wide", target === lang.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated hover:text-fg"),
					children: lang.name
				}, lang.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex border-b border-border md:hidden",
				children: [
					"source",
					"emit",
					"console"
				].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPane(id),
					className: cn("h-11 flex-1 text-sm", pane === id ? "border-b border-fg text-fg" : "text-muted"),
					children: id === "source" ? t.source : id === "emit" ? t.output : t.console
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col md:hidden",
				children: [
					pane === "source" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
						value: source,
						onChange: setSource,
						html: sourceHtml,
						label: t.source,
						className: "min-h-64"
					}) : null,
					pane === "emit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
						value: emitted.ok ? emitted.code : "",
						html: emitHtml,
						readOnly: true,
						label: t.output,
						className: "min-h-64"
					}) : null,
					pane === "console" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsoleBody, {
						text: consoleText,
						error: Boolean(consoleState.error)
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden min-h-0 flex-1 md:flex md:flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(pn, {
					orientation: "vertical",
					className: "flex min-h-0 flex-1 flex-col",
					defaultLayout: {
						editors: 72,
						console: 28
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(yn, {
							id: "editors",
							minSize: 40,
							className: "min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(pn, {
								orientation: "horizontal",
								className: "flex h-full min-h-0",
								defaultLayout: {
									source: 50,
									emit: 50
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(yn, {
										id: "source",
										minSize: 25,
										className: "min-h-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex h-full min-h-0 flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaneLabel, { children: t.source }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
												value: source,
												onChange: setSource,
												html: sourceHtml,
												label: t.source
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(bn, { className: "w-px bg-border data-[separator=active]:bg-accent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(yn, {
										id: "emit",
										minSize: 25,
										className: "min-h-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex h-full min-h-0 flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaneLabel, { children: [t.output, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-2 font-sans text-subtle",
												children: [".", TARGETS.find((x) => x.id === target)?.ext]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
												value: emitted.ok ? emitted.code : "",
												html: emitHtml,
												readOnly: true,
												label: t.output
											})]
										})
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(bn, { className: "h-px bg-border data-[separator=active]:bg-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(yn, {
							id: "console",
							minSize: 16,
							className: "min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-full min-h-0 flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaneLabel, { children: t.console }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsoleBody, {
									text: consoleText,
									error: Boolean(consoleState.error)
								})]
							})
						})
					]
				})
			})
		]
	});
}
function PaneLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-9 shrink-0 items-center border-b border-border px-3 font-mono text-xs uppercase tracking-wider text-muted",
		children
	});
}
function ConsoleBody({ text, error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: cn("min-h-32 flex-1 overflow-auto bg-bg px-4 py-3 font-mono text-sm leading-6 whitespace-pre-wrap", error ? "text-danger" : "text-fg"),
		children: text
	});
}
function PlaygroundPage() {
	const { ex, src, lang } = Route.useSearch();
	let initialSource;
	if (src) try {
		initialSource = decodeURIComponent(atob(src));
	} catch {
		initialSource = void 0;
	}
	else if (ex) initialSource = EXAMPLES.find((e) => e.id === ex)?.code;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		dense: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaygroundView, {
			initialSource,
			initialTarget: lang
		})
	});
}
//#endregion
export { PlaygroundPage as component };
