import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, _ as lazyRouteComponent, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as number, c as union, i as literal, l as unknown, n as _enum, o as object, r as discriminatedUnion, s as string, t as number$1 } from "../_libs/zod.mjs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DI17fM0c.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-qDll6uhg.css";
var APP_NAME = "Aether";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Aether — one language, every language. Write once, run it, emit it into eighteen targets."
			},
			{
				name: "theme-color",
				content: "#0b0c0e"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "tr",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-7_ddVMQU.mjs");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./learn-U2fI27zb.mjs");
var Route$2 = createFileRoute("/learn")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./playground-Djp-RP0_.mjs");
var Route$1 = createFileRoute("/playground")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	validateSearch: (s) => ({
		ex: typeof s.ex === "string" ? s.ex : void 0,
		src: typeof s.src === "string" ? s.src : void 0,
		lang: typeof s.lang === "string" ? s.lang : void 0
	})
});
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef$1 = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef$1.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef$1.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef$1.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef$1.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef$1.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef$1.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef$1.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef$1.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
/**
* Bounded WebRTC signaling relay.
* Only SDP/ICE rendezvous data crosses the server; application data remains P2P.
*/
var ID = string().regex(/^[A-Za-z0-9_-]{1,64}$/);
var NAME = string().trim().max(64);
var MAX_SIGNAL_BYTES = 32768;
var MAX_ROOM_PEERS = 32;
var MAX_SIGNALS_PER_POLL = 100;
var PEER_TTL_SECONDS = 30;
var SIGNAL_TTL_SECONDS = 60;
var TOKEN_BYTES = 32;
var MAX_REQUEST_BYTES = 40960;
var RATE_WINDOW_MS = 1e4;
var RATE_LIMIT = 60;
var rateMap = /* @__PURE__ */ new Map();
var signalSchema = object({
	op: literal("signal"),
	room: ID,
	from: ID,
	to: ID,
	kind: _enum([
		"offer",
		"answer",
		"ice"
	]),
	payload: unknown().superRefine((value, ctx) => {
		try {
			if (new TextEncoder().encode(JSON.stringify(value)).byteLength > MAX_SIGNAL_BYTES) ctx.addIssue({
				code: "custom",
				message: "payload too large"
			});
		} catch {
			ctx.addIssue({
				code: "custom",
				message: "payload is not serializable"
			});
		}
	})
});
var leaveSchema = object({
	op: literal("leave"),
	room: ID,
	peer: ID
});
var postSchema = discriminatedUnion("op", [signalSchema, leaveSchema]);
var globalRef = globalThis;
function ensureSchema(sql) {
	globalRef.__aetherRtcSchemaPromise__ ??= (async () => {
		await sql.query(`CREATE TABLE IF NOT EXISTS webrtc_peers (
      room TEXT NOT NULL,
      peer_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (room, peer_id)
    )`);
		await sql.query(`CREATE TABLE IF NOT EXISTS webrtc_signals (
      id BIGSERIAL PRIMARY KEY,
      room TEXT NOT NULL,
      to_peer TEXT NOT NULL,
      from_peer TEXT NOT NULL,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
		await sql.query(`ALTER TABLE webrtc_peers ADD COLUMN IF NOT EXISTS token_hash TEXT`);
		await sql.query(`CREATE INDEX IF NOT EXISTS webrtc_signals_inbox
      ON webrtc_signals (room, to_peer, id)`);
	})().catch((error) => {
		globalRef.__aetherRtcSchemaPromise__ = void 0;
		throw error;
	});
	return globalRef.__aetherRtcSchemaPromise__;
}
function json(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
			"x-content-type-options": "nosniff"
		}
	});
}
async function prune(sql) {
	await Promise.all([sql.query(`DELETE FROM webrtc_signals WHERE created_at < now() - make_interval(secs => $1)`, [SIGNAL_TTL_SECONDS]), sql.query(`DELETE FROM webrtc_peers WHERE last_seen < now() - make_interval(secs => $1)`, [PEER_TTL_SECONDS])]);
}
async function roster(sql, room) {
	return (await sql.query(`SELECT peer_id, name FROM webrtc_peers
     WHERE room = $1 AND last_seen > now() - make_interval(secs => $2)
     ORDER BY peer_id LIMIT $3`, [
		room,
		PEER_TTL_SECONDS,
		MAX_ROOM_PEERS
	])).map((row) => ({
		id: row.peer_id,
		name: row.name
	}));
}
function tokenHash(token) {
	return createHash("sha256").update(token).digest("hex");
}
function issueToken() {
	return randomBytes(TOKEN_BYTES).toString("base64url");
}
function clientKey(request) {
	return request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}
function checkRateLimit(request) {
	const now = Date.now();
	const key = clientKey(request);
	const current = rateMap.get(key);
	if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
		rateMap.set(key, {
			startedAt: now,
			count: 1
		});
		if (rateMap.size > 1e4) {
			for (const [k, value] of rateMap) if (now - value.startedAt >= RATE_WINDOW_MS) rateMap.delete(k);
		}
		return true;
	}
	if (current.count >= RATE_LIMIT) return false;
	current.count += 1;
	return true;
}
async function findPeer(sql, room, peer) {
	const rows = await sql.query(`SELECT token_hash FROM webrtc_peers WHERE room = $1 AND peer_id = $2`, [room, peer]);
	return rows[0] ? { tokenHash: rows[0].token_hash } : null;
}
async function touchPeer(sql, room, peer, name, tokenHashValue) {
	await sql.query(`INSERT INTO webrtc_peers (room, peer_id, token_hash, name, last_seen)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (room, peer_id)
     DO UPDATE SET last_seen = now(), name = EXCLUDED.name`, [
		room,
		peer,
		tokenHashValue,
		name
	]);
}
function constantTimeTokenMatch(expectedHash, suppliedToken) {
	if (!expectedHash) return false;
	const actual = Buffer.from(tokenHash(suppliedToken), "hex");
	const expected = Buffer.from(expectedHash, "hex");
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
async function authenticatePeer(sql, room, peer, token) {
	if (!token || token.length < 40 || token.length > 128) return false;
	const existing = await findPeer(sql, room, peer);
	return existing ? constantTimeTokenMatch(existing.tokenHash, token) : false;
}
async function readBoundedJson(request) {
	const length = Number(request.headers.get("content-length") ?? 0);
	if (Number.isFinite(length) && length > MAX_REQUEST_BYTES) throw new Error("__too_large__");
	if (!request.body) return null;
	const reader = request.body.getReader();
	const chunks = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > MAX_REQUEST_BYTES) throw new Error("__too_large__");
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return JSON.parse(new TextDecoder().decode(bytes));
}
async function handleGet(url, request) {
	const parsed = object({
		room: ID,
		peer: ID,
		name: NAME.default(""),
		since: number$1().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0)
	}).safeParse({
		room: url.searchParams.get("room"),
		peer: url.searchParams.get("peer"),
		name: url.searchParams.get("name") ?? "",
		since: url.searchParams.get("since") ?? 0
	});
	if (!parsed.success) return json({ error: "invalid query" }, 400);
	const { room, peer, name, since } = parsed.data;
	const sql = await getSql();
	await ensureSchema(sql);
	const suppliedToken = request.headers.get("x-aether-rtc-token");
	const existing = await findPeer(sql, room, peer);
	let token = suppliedToken;
	if (existing) {
		if (existing.tokenHash && (!suppliedToken || !constantTimeTokenMatch(existing.tokenHash, suppliedToken))) return json({ error: "invalid peer capability" }, 401);
		if (!existing.tokenHash) token = issueToken();
	} else token = issueToken();
	if (!token) return json({ error: "invalid peer capability" }, 401);
	if (since === 0 || Math.random() < .02) await prune(sql);
	const currentRoster = await roster(sql, room);
	if (!existing && currentRoster.length >= MAX_ROOM_PEERS) return json({ error: "room is full" }, 409);
	await touchPeer(sql, room, peer, name, tokenHash(token));
	const rows = await sql.query(`SELECT id, from_peer, kind, payload FROM webrtc_signals
     WHERE room = $1 AND to_peer = $2 AND id > $3
     ORDER BY id LIMIT $4`, [
		room,
		peer,
		since,
		MAX_SIGNALS_PER_POLL
	]);
	return json({
		peers: await roster(sql, room),
		signals: rows.map((row) => ({
			id: row.id,
			from: row.from_peer,
			kind: row.kind,
			payload: row.payload
		})),
		token
	});
}
async function handlePost(request) {
	let body;
	try {
		body = await readBoundedJson(request);
	} catch (error) {
		return json({ error: error instanceof Error && error.message === "__too_large__" ? "request too large" : "invalid JSON" }, error instanceof Error && error.message === "__too_large__" ? 413 : 400);
	}
	const parsed = postSchema.safeParse(body);
	if (!parsed.success) return json({ error: "invalid request" }, 400);
	const msg = parsed.data;
	const token = request.headers.get("x-aether-rtc-token");
	if (!token || token.length < 40 || token.length > 128) return json({ error: "missing peer capability" }, 401);
	const sql = await getSql();
	await ensureSchema(sql);
	if (msg.op === "signal") {
		if (!await authenticatePeer(sql, msg.room, msg.from, token)) return json({ error: "invalid peer capability" }, 401);
		if (msg.from === msg.to) return json({ error: "cannot signal yourself" }, 400);
		if (!(await roster(sql, msg.room)).some((peer) => peer.id === msg.to)) return json({ error: "peer is not in room" }, 404);
		await sql.query(`INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload)
       VALUES ($1, $2, $3, $4, $5)`, [
			msg.room,
			msg.to,
			msg.from,
			msg.kind,
			JSON.stringify(msg.payload)
		]);
	} else {
		if (!await authenticatePeer(sql, msg.room, msg.peer, token)) return json({ error: "invalid peer capability" }, 401);
		await sql.query(`DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2`, [msg.room, msg.peer]);
		await sql.query(`DELETE FROM webrtc_signals WHERE room = $1 AND (to_peer = $2 OR from_peer = $2)`, [msg.room, msg.peer]);
	}
	return json({ ok: true });
}
async function handleSignaling(request) {
	try {
		if (request.method !== "GET" && request.method !== "POST") return json({ error: "method not allowed" }, 405);
		if (!checkRateLimit(request)) return json({ error: "rate limit exceeded" }, 429);
		const origin = request.headers.get("origin");
		const requestOrigin = new URL(request.url).origin;
		if (origin && origin !== requestOrigin) return json({ error: "cross-origin request denied" }, 403);
		const fetchSite = request.headers.get("sec-fetch-site");
		if (fetchSite && ![
			"same-origin",
			"same-site",
			"none"
		].includes(fetchSite)) return json({ error: "cross-site request denied" }, 403);
		if (request.method === "POST") {
			if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return json({ error: "unsupported media type" }, 415);
		}
		if (request.method === "GET") return await handleGet(new URL(request.url), request);
		return await handlePost(request);
	} catch (error) {
		console.error("[rtc] signaling error:", error instanceof Error ? error.message : "unknown error");
		return json({ error: "signaling failed" }, 500);
	}
}
var handle = ({ request }) => handleSignaling(request);
var Route = createFileRoute("/api/rtc")({ server: { handlers: {
	GET: handle,
	POST: handle
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	LearnRoute: Route$2.update({
		id: "/learn",
		path: "/learn",
		getParentRoute: () => Route$4
	}),
	PlaygroundRoute: Route$1.update({
		id: "/playground",
		path: "/playground",
		getParentRoute: () => Route$4
	}),
	ApiRtcRoute: Route.update({
		id: "/api/rtc",
		path: "/api/rtc",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$1 as n, router_exports as t };
