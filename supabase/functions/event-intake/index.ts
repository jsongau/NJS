import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

// Funnel events for NJS Studio. Same guard rails as lead-intake: origin allowlist, per-IP
// rate limit, strict validation, service-role write. Accepts text/plain so the page can use
// navigator.sendBeacon (a beacon cannot send a CORS preflight). Always answers 204 to the page
// on bad input, so a broken event never shows the visitor an error.

const DEFAULT_ORIGINS = [
  "https://nathanjsong.com",
  "https://www.nathanjsong.com",
  "http://localhost:3000",
  "http://localhost:8765",
  "http://127.0.0.1:5500",
];
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? DEFAULT_ORIGINS.join(","))
  .split(",").map((s) => s.trim()).filter(Boolean);

const EVENTS = new Set([
  "page_view", "picker_open", "business_picked", "plan_picked",
  "build_step", "plan_seen", "form_open", "lead_sent", "call_click",
  "mode_switch", "goal_picked",
]);
const DEVICES = new Set(["phone", "tablet", "desktop"]);
const MAX_PER_10_MIN = 300;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

function allowed(origin: string | null) {
  return !!origin && (ALLOWED.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin));
}

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowed(origin) ? origin! : ALLOWED[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s.length ? s : null;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(null, { status: 405, headers });
  if (!allowed(origin)) return new Response(null, { status: 403, headers });

  let body: Record<string, unknown>;
  try { body = JSON.parse(await req.text()); } catch { return new Response(null, { status: 204, headers }); }

  const event = clean(body.event, 30);
  const page = clean(body.page, 200);
  const sid = clean(body.sid, 32);
  if (!event || !EVENTS.has(event) || !page || !sid || !/^[a-z0-9]{8,32}$/.test(sid)) {
    return new Response(null, { status: 204, headers });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha256(ip + (Deno.env.get("IP_SALT") ?? "njs-event-intake"));

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase.from("studio_events").select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_10_MIN) return new Response(null, { status: 429, headers });

  const device = clean(body.device, 10);
  await supabase.from("studio_events").insert({
    event, page, sid,
    business_type: clean(body.business_type, 60),
    tier: clean(body.tier, 30),
    detail: clean(body.detail, 80),
    referrer_host: clean(body.referrer_host, 120),
    utm_source: clean(body.utm_source, 120),
    utm_campaign: clean(body.utm_campaign, 120),
    device: device && DEVICES.has(device) ? device : null,
    mode: body.mode === "fitness" ? "fitness" : "business",
    ip_hash: ipHash,
  });

  return new Response(null, { status: 204, headers });
});
