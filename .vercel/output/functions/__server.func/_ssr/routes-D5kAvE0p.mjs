import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as highlightAether, f as useCopy, i as CodePane, l as highlightTarget, n as AppShell, o as TARGETS, r as Button, s as cn, t as AetherMark } from "./highlight-BhGFhx_-.mjs";
import { o as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as emit } from "./aether-D2AFMzg8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D5kAvE0p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEMO = `fn greet(name: str) -> str {
  return "Hello, " + name
}

fn main() {
  print(greet("Ada"))
}
`;
var CYCLE = [
	"python",
	"javascript",
	"go",
	"rust",
	"java",
	"ruby",
	"swift",
	"haskell"
];
function Home() {
	const t = useCopy();
	const [idx, setIdx] = (0, import_react.useState)(0);
	const target = CYCLE[idx];
	const sourceHtml = (0, import_react.useMemo)(() => highlightAether(DEMO), []);
	const out = (0, import_react.useMemo)(() => emit(DEMO, target), [target]);
	const outHtml = (0, import_react.useMemo)(() => highlightTarget(out.ok ? out.code : "", target), [out, target]);
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = window.setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), 2400);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative flex flex-col items-center pt-12 pb-14 text-center sm:pt-20 sm:pb-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AetherMark, { className: "mb-6 size-12 text-accent sm:size-14" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-6xl leading-none tracking-[-0.03em] italic sm:text-8xl",
						children: "Aether"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-xl font-display text-2xl leading-snug text-fg sm:text-3xl",
						children: t.tagline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-xl text-base leading-relaxed text-muted",
						children: t.lead
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/playground",
								children: [t.ctaPlay, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/learn",
								children: t.ctaLearn
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-h-72 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-64 flex-col border-b border-border md:border-r md:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-10 items-center border-b border-border px-4 font-mono text-xs uppercase tracking-wider text-muted",
							children: "Aether"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
							value: DEMO,
							html: sourceHtml,
							readOnly: true,
							label: "Aether"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-64 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex h-10 items-center justify-between border-b border-border px-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs uppercase tracking-wider text-muted",
								children: TARGETS.find((x) => x.id === target)?.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: CYCLE.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": id,
									onClick: () => setIdx(i),
									className: cn("size-1.5 rounded-full", i === idx ? "bg-accent" : "bg-border-strong")
								}, id))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodePane, {
							value: out.ok ? out.code : "",
							html: outHtml,
							readOnly: true,
							label: target
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 font-mono text-xs uppercase tracking-wider text-subtle",
					children: t.target
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap gap-x-4 gap-y-2",
					children: TARGETS.map((lang) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "font-mono text-sm text-muted",
						children: lang.name
					}, lang.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3",
				children: [
					{
						k: t.principle1t,
						v: t.principle1,
						n: "01"
					},
					{
						k: t.principle2t,
						v: t.principle2,
						n: "02"
					},
					{
						k: t.principle3t,
						v: t.principle3,
						n: "03"
					}
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "bg-surface px-5 py-6 sm:px-6 sm:py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs text-subtle",
							children: p.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-display text-2xl italic tracking-tight",
							children: p.k
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-relaxed text-muted",
							children: p.v
						})
					]
				}, p.n))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-16 border-t border-border pt-8 text-sm text-subtle",
				children: t.footer
			})
		]
	}) });
}
//#endregion
export { Home as component };
