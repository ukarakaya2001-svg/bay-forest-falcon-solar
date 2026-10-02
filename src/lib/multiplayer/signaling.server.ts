/**
 * Bounded WebRTC signaling relay.
 * Only SDP/ICE rendezvous data crosses the server; application data remains P2P.
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import type { PeerRow, RtcPollResponse, SignalRow } from "./p2p";

const ID = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const NAME = z.string().trim().max(64);
const MAX_SIGNAL_BYTES = 32_768;
const MAX_ROOM_PEERS = 32;
const MAX_SIGNALS_PER_POLL = 100;
const PEER_TTL_SECONDS = 30;
const SIGNAL_TTL_SECONDS = 60;
const TOKEN_BYTES = 32;
const MAX_REQUEST_BYTES = 40_960;
const RATE_WINDOW_MS = 10_000;
const RATE_LIMIT = 60;

type RateEntry = { startedAt: number; count: number };
const rateMap = new Map<string, RateEntry>();

const signalSchema = z.object({
  op: z.literal("signal"),
  room: ID,
  from: ID,
  to: ID,
  kind: z.enum(["offer", "answer", "ice"]),
  payload: z.unknown().superRefine((value, ctx) => {
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(value)).byteLength;
      if (bytes > MAX_SIGNAL_BYTES) {
        ctx.addIssue({ code: "custom", message: "payload too large" });
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "payload is not serializable" });
    }
  }),
});
const leaveSchema = z.object({ op: z.literal("leave"), room: ID, peer: ID });
const postSchema = z.discriminatedUnion("op", [signalSchema, leaveSchema]);

const globalRef = globalThis as typeof globalThis & {
  __aetherRtcSchemaPromise__?: Promise<void>;
};

function ensureSchema(sql: Sql): Promise<void> {
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
    globalRef.__aetherRtcSchemaPromise__ = undefined;
    throw error;
  });
  return globalRef.__aetherRtcSchemaPromise__;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function prune(sql: Sql): Promise<void> {
  await Promise.all([
    sql.query(`DELETE FROM webrtc_signals WHERE created_at < now() - make_interval(secs => $1)`, [SIGNAL_TTL_SECONDS]),
    sql.query(`DELETE FROM webrtc_peers WHERE last_seen < now() - make_interval(secs => $1)`, [PEER_TTL_SECONDS]),
  ]);
}

async function roster(sql: Sql, room: string): Promise<PeerRow[]> {
  const rows = await sql.query<{ peer_id: string; name: string }>(
    `SELECT peer_id, name FROM webrtc_peers
     WHERE room = $1 AND last_seen > now() - make_interval(secs => $2)
     ORDER BY peer_id LIMIT $3`,
    [room, PEER_TTL_SECONDS, MAX_ROOM_PEERS],
  );
  return rows.map((row) => ({ id: row.peer_id, name: row.name }));
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function issueToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function checkRateLimit(request: Request): boolean {
  const now = Date.now();
  const key = clientKey(request);
  const current = rateMap.get(key);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateMap.set(key, { startedAt: now, count: 1 });
    if (rateMap.size > 10_000) {
      for (const [k, value] of rateMap) {
        if (now - value.startedAt >= RATE_WINDOW_MS) rateMap.delete(k);
      }
    }
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

async function findPeer(sql: Sql, room: string, peer: string): Promise<{ tokenHash: string | null } | null> {
  const rows = await sql.query<{ token_hash: string | null }>(
    `SELECT token_hash FROM webrtc_peers WHERE room = $1 AND peer_id = $2`,
    [room, peer],
  );
  return rows[0] ? { tokenHash: rows[0].token_hash } : null;
}

async function touchPeer(sql: Sql, room: string, peer: string, name: string, tokenHashValue: string): Promise<void> {
  await sql.query(
    `INSERT INTO webrtc_peers (room, peer_id, token_hash, name, last_seen)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (room, peer_id)
     DO UPDATE SET last_seen = now(), name = EXCLUDED.name`,
    [room, peer, tokenHashValue, name],
  );
}

function constantTimeTokenMatch(expectedHash: string | null, suppliedToken: string): boolean {
  if (!expectedHash) return false;
  const actual = Buffer.from(tokenHash(suppliedToken), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function authenticatePeer(sql: Sql, room: string, peer: string, token: string | null): Promise<boolean> {
  if (!token || token.length < 40 || token.length > 128) return false;
  const existing = await findPeer(sql, room, peer);
  return existing ? constantTimeTokenMatch(existing.tokenHash, token) : false;
}

async function readBoundedJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > MAX_REQUEST_BYTES) throw new Error("__too_large__");
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
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
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function handleGet(url: URL, request: Request): Promise<Response> {
  const parsed = z.object({
    room: ID,
    peer: ID,
    name: NAME.default(""),
    since: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
  }).safeParse({
    room: url.searchParams.get("room"),
    peer: url.searchParams.get("peer"),
    name: url.searchParams.get("name") ?? "",
    since: url.searchParams.get("since") ?? 0,
  });
  if (!parsed.success) return json({ error: "invalid query" }, 400);

  const { room, peer, name, since } = parsed.data;
  const sql = await getSql();
  await ensureSchema(sql);
  const suppliedToken = request.headers.get("x-aether-rtc-token");
  const existing = await findPeer(sql, room, peer);
  let token = suppliedToken;
  if (existing) {
    if (existing.tokenHash && (!suppliedToken || !constantTimeTokenMatch(existing.tokenHash, suppliedToken))) {
      return json({ error: "invalid peer capability" }, 401);
    }
    if (!existing.tokenHash) token = issueToken();
  } else {
    token = issueToken();
  }
  if (!token) return json({ error: "invalid peer capability" }, 401);

  if (since === 0 || Math.random() < 0.02) await prune(sql);
  const currentRoster = await roster(sql, room);
  if (!existing && currentRoster.length >= MAX_ROOM_PEERS) return json({ error: "room is full" }, 409);
  await touchPeer(sql, room, peer, name, tokenHash(token));

  const rows = await sql.query<{ id: number; from_peer: string; kind: SignalRow["kind"]; payload: unknown }>(
    `SELECT id, from_peer, kind, payload FROM webrtc_signals
     WHERE room = $1 AND to_peer = $2 AND id > $3
     ORDER BY id LIMIT $4`,
    [room, peer, since, MAX_SIGNALS_PER_POLL],
  );

  const body: RtcPollResponse = {
    peers: await roster(sql, room),
    signals: rows.map((row) => ({ id: row.id, from: row.from_peer, kind: row.kind, payload: row.payload })),
    token,
  };
  return json(body);
}

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
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
    const authenticated = await authenticatePeer(sql, msg.room, msg.from, token);
    if (!authenticated) return json({ error: "invalid peer capability" }, 401);
    if (msg.from === msg.to) return json({ error: "cannot signal yourself" }, 400);
    const peers = await roster(sql, msg.room);
    if (!peers.some((peer) => peer.id === msg.to)) return json({ error: "peer is not in room" }, 404);
    await sql.query(
      `INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [msg.room, msg.to, msg.from, msg.kind, JSON.stringify(msg.payload)],
    );
  } else {
    if (!(await authenticatePeer(sql, msg.room, msg.peer, token))) return json({ error: "invalid peer capability" }, 401);
    await sql.query(`DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2`, [msg.room, msg.peer]);
    await sql.query(`DELETE FROM webrtc_signals WHERE room = $1 AND (to_peer = $2 OR from_peer = $2)`, [msg.room, msg.peer]);
  }
  return json({ ok: true });
}

export async function handleSignaling(request: Request): Promise<Response> {
  try {
    if (request.method !== "GET" && request.method !== "POST") return json({ error: "method not allowed" }, 405);
    if (!checkRateLimit(request)) return json({ error: "rate limit exceeded" }, 429);
    const origin = request.headers.get("origin");
    const requestOrigin = new URL(request.url).origin;
    if (origin && origin !== requestOrigin) return json({ error: "cross-origin request denied" }, 403);
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
      return json({ error: "cross-site request denied" }, 403);
    }
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return json({ error: "unsupported media type" }, 415);
      }
    }
    if (request.method === "GET") return await handleGet(new URL(request.url), request);
    return await handlePost(request);
  } catch (error) {
    console.error("[rtc] signaling error:", error instanceof Error ? error.message : "unknown error");
    return json({ error: "signaling failed" }, 500);
  }
}
