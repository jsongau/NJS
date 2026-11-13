import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Public form endpoint for the Nathan J. Song site. It does its own checks
// (origin allowlist, honeypot, per-IP rate limit, validation) and writes with
// the service role, so the tables stay closed to the public.
// v2 (2026-11-09, Fitness F1): allow-listed `meta` for fitness requests, a cleaner
// notify email for Jay, and a confirmation email to the visitor for `train` requests.
// v3 (2026-11-09, booker): any day, half hours, part-of-day requests, service area from the ZIP
// search. v4 (2026-11-12): one pack only (12-pack); the free trial was dropped before launch.

const DEFAULT_ORIGINS = [
  "https://nathanjsong.com",
  "https://www.nathanjsong.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8765",
  "http://127.0.0.1:5500",
];
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? DEFAULT_ORIGINS.join(","))
  .split(",").map((s) => s.trim()).filter(Boolean);

const DOORS = ["build", "dental", "learn", "train", "kids"];
const LOCATIONS = ["brea", "rancho-santa-margarita", "corona", "in-home", "online"];
const MAX_PER_10_MIN = 5;

// Every key and value in meta is allow-listed: no free text, no personal data.
const DISCIPLINES = ["personal-training", "clubs-and-maces", "striking", "kickboxing", "yoga", "reformer-pilates"];
const PACKS = ["12-pack"];
const AREAS = ["North OC", "Central OC", "South OC", "East LA", "Inland Empire"];
const PARTS = ["morning", "midday", "evening"];
const AI = ["business", "job", "later"];
const FOCUS = ["muscle", "fat-loss", "shoulders", "boxing", "kickboxing", "muay-thai", "conditioning", "mobility", "pilates"];
const TIMES = ["weekday-mornings", "weekday-midday", "weekday-evenings", "weekends"];
const ENTRIES = ["hero_card", "goal_grid", "form", "calendar", "pack", "booker"];
const LABEL: Record<string, string> = {
  "personal-training": "personal training", "clubs-and-maces": "clubs and maces", striking: "kickboxing or boxing",
  kickboxing: "kickboxing", yoga: "yoga", "reformer-pilates": "reformer Pilates",
  brea: "Brea", "rancho-santa-margarita": "Rancho Santa Margarita", corona: "Corona", "in-home": "your place", online: "online",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

function cors(origin: string | null) {
  const ok = origin && (ALLOWED.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ALLOWED[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s.length ? s : null;
}

export function cleanMeta(raw: unknown): Record<string, unknown> {
  const m = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw as Record<string, unknown> : {};
  const out: Record<string, unknown> = {};
  if (typeof m.discipline === "string" && DISCIPLINES.includes(m.discipline)) out.discipline = m.discipline;
  if (typeof m.goal === "string" && /^[a-z0-9-]{1,40}$/.test(m.goal)) out.goal = m.goal;
  if (Array.isArray(m.times)) {
    const t = [...new Set(m.times.filter((x) => typeof x === "string" && TIMES.includes(x)))];
    if (t.length) out.times = t;
  }
  if (typeof m.entry === "string" && ENTRIES.includes(m.entry)) out.entry = m.entry;
  if (typeof m.pack === "string" && PACKS.includes(m.pack)) out.pack = m.pack;
  if (Array.isArray(m.focus)) {
    const f = [...new Set(m.focus.filter((x) => typeof x === "string" && FOCUS.includes(x)))].slice(0, 2);
    if (f.length) out.focus = f;
  }
  // An hour (or half hour) picked in the booker, local Pacific "YYYY-MM-DDTHH" or "YYYY-MM-DDTHH:30".
  if (typeof m.slot === "string" && /^\d{4}-\d{2}-\d{2}T(0[6-9]|1\d)(:30)?$/.test(m.slot)) out.slot = m.slot;
  // A part of a day for request-only places, "YYYY-MM-DD:morning".
  if (typeof m.part === "string" && new RegExp("^\\d{4}-\\d{2}-\\d{2}:(" + PARTS.join("|") + ")$").test(m.part)) out.part = m.part;
  if (m.member === true) out.member = true;
  if (typeof m.area === "string" && AREAS.includes(m.area)) out.area = m.area;
  if (typeof m.ai === "string" && AI.includes(m.ai)) out.ai = m.ai;
  if (m.first === true) out.first = true;
  return out;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function send(to: string, subject: string, text: string, replyTo?: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "no_key";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM") ?? "leads@nathanjsong.com",
        to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return r.ok ? "sent" : "error_" + r.status;
  } catch (_) { return "error"; }
}

// To Jay: what they want first, contact details second.
function notifyText(row: Record<string, unknown>, meta: Record<string, unknown>) {
  const top = [
    meta.pack ? `Pack: ${meta.pack}` : null,
    meta.focus ? `Focus: ${(meta.focus as string[]).join(", ")}` : null,
    meta.slot ? `Requested time: ${slotLabel(meta.slot as string)} Pacific` : null,
    meta.part ? `Requested: ${(meta.part as string).replace(":", ", ")} (reply with an exact time)` : null,
    meta.member ? "Says they're a member of the gym (free trial)" : null,
    meta.area ? `Area: ${meta.area}` : null,
    meta.ai ? `AI session for: ${meta.ai}` : null,
    meta.first ? "First session with Nathan" : null,
    meta.discipline ? `Discipline: ${LABEL[meta.discipline as string]}` : null,
    row.location ? `Where: ${LABEL[row.location as string] ?? row.location}` : null,
    meta.goal ? `Goal: ${meta.goal}` : null,
    meta.times ? `Times: ${(meta.times as string[]).join(", ")}` : null,
    meta.entry ? `Came in from: ${meta.entry}` : null,
  ].filter(Boolean);
  const rest = ["name", "email", "phone", "message", "page", "referrer", "consent_marketing"]
    .map((k) => `${k}: ${row[k] ?? ""}`);
  return [...top, "", ...rest].join("\n");
}

function slotLabel(slot: string) {
  const h = Number(slot.slice(11, 13)); const mm = slot.length > 13 ? "30" : "00";
  return `${slot.slice(0, 10)} at ${h % 12 || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}
function slotText(meta: Record<string, unknown>) {
  if (typeof meta.slot === "string") return ` You asked for ${slotLabel(meta.slot)} Pacific.`;
  if (typeof meta.part === "string") { const [d, p] = meta.part.split(":"); return ` You asked for the ${p} of ${d}; I'll reply with an exact time.`; }
  return "";
}

// To the visitor (train only): confirms what they asked for and what happens next.
// The reply-time promise comes from REPLY_PROMISE, set by Jay; without it, no time is promised.
function confirmText(row: Record<string, unknown>, meta: Record<string, unknown>) {
  const first = String(row.name).split(/\s+/)[0];
  const what = meta.pack === "free-trial" ? "a free trial session" : meta.pack ? `the ${meta.pack}${meta.discipline ? ` (${LABEL[meta.discipline as string]})` : ""}`
    : meta.discipline ? `a first ${LABEL[meta.discipline as string]} session` : "a private session";
  const where = row.location ? (row.location === "online" ? " online" : row.location === "in-home" ? " at your place" : ` in ${LABEL[row.location as string]}`) : "";
  const promise = meta.pack === "free-trial" ? "I'll reply by email to confirm your time. Bring your gym membership to the session."
    : Deno.env.get("REPLY_PROMISE") ?? "I'll reply by email with your time and the price.";
  return [
    `Hi ${first},`,
    "",
    `Thanks for asking about ${what}${where}.${slotText(meta)} Your request is pending until I confirm it. ${promise}`,
    "",
    "If anything changes (days, old injuries, what you want to work on), just reply to this email.",
    "",
    "Nathan",
    "NJS Fitness · nathanjsong.com/fitness",
  ].join("\n");
}

Deno.serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, headers);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400, headers); }

  // Honeypot: real people never fill this hidden field. Pretend success.
  if (clean(body.company_website, 200)) return json({ ok: true }, 200, headers);

  const door = clean(body.door, 20);
  const name = clean(body.name, 120);
  const email = clean(body.email, 254)?.toLowerCase() ?? null;
  const location = clean(body.location, 40);
  if (!door || !DOORS.includes(door)) return json({ error: "invalid_door" }, 422, headers);
  if (!name) return json({ error: "name_required" }, 422, headers);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "invalid_email" }, 422, headers);
  if (location && !LOCATIONS.includes(location)) return json({ error: "invalid_location" }, 422, headers);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha256(ip + (Deno.env.get("IP_SALT") ?? "njs-lead-intake"));

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase.from("leads").select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_10_MIN) return json({ error: "rate_limited" }, 429, headers);

  const meta = door === "train" ? cleanMeta(body.meta) : {};
  const row = {
    door, name, email, location, meta,
    phone: clean(body.phone, 40),
    city: clean(body.city, 80),
    message: clean(body.message, 4000),
    page: clean(body.page, 300),
    referrer: clean(body.referrer, 500),
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    consent_marketing: body.consent_marketing === true,
    consent_sms: body.consent_sms === true,
    ip_hash: ipHash,
    user_agent: clean(req.headers.get("user-agent"), 400),
  };

  const { data, error } = await supabase.from("leads").insert(row).select("id").single();
  if (error) return json({ error: "save_failed" }, 500, headers);

  // Emails never block or fail the request: the row is already saved.
  const jay = Deno.env.get("NOTIFY_EMAIL");
  const label = door === "train" && meta.pack === "free-trial" ? "free trial request" : door === "train" && meta.discipline ? `${door} lead (${LABEL[meta.discipline as string]})` : `${door} lead`;
  const mail: Record<string, string> = {};
  if (jay) mail.notify = await send(jay, `New ${label}: ${name}`, notifyText(row, meta), email);
  if (door === "train") mail.confirm = await send(email, "Got your session request", confirmText(row, meta), jay ?? undefined);
  return json({ ok: true, id: data.id, mail }, 201, headers);
});
