import type { BuiltEmail } from "./orderEmail";

/**
 * Email transport.
 *
 * There are two implementations behind one interface, and the app ships
 * with the demo one. That is a deliberate choice rather than an
 * unfinished feature.
 *
 * This app is static files in a public repository. A Resend API key in
 * client code would ship inside the JavaScript bundle, where anyone
 * viewing source could read it and send mail as the owner until it was
 * rotated. There is no safe client-side way to hold that secret, so real
 * sending has to go through a server function that keeps the key in
 * environment settings.
 *
 * Until that function exists, `demoTransport` records the send, returns a
 * reference, and does not touch the network. Every screen says so.
 *
 * TO TURN ON REAL SENDING, three steps and no rewrite:
 *
 *   1. Add `api/send-order.ts` to the njs-site repo (Vercel picks up
 *      /api automatically; the static pages are unaffected):
 *
 *        export default async function handler(req, res) {
 *          if (req.method !== "POST") return res.status(405).end();
 *          const { subject, html, text } = req.body;
 *          const r = await fetch("https://api.resend.com/emails", {
 *            method: "POST",
 *            headers: {
 *              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
 *              "Content-Type": "application/json",
 *            },
 *            body: JSON.stringify({
 *              from: "Nathan J. Song <orders@nathanjsong.com>",
 *              to: [process.env.ORDER_DESK_TO],   // fixed server-side
 *              subject, html, text,
 *            }),
 *          });
 *          const data = await r.json();
 *          return res.status(r.ok ? 200 : 502).json(data);
 *        }
 *
 *   2. Set RESEND_API_KEY and ORDER_DESK_TO in the Vercel project
 *      settings. Never in the repo.
 *
 *   3. Verify a sending domain in Resend by adding its DNS records to
 *      nathanjsong.com. Without that, Resend only allows sending from
 *      onboarding@resend.dev to the account owner's own address.
 *
 * Then swap `activeTransport` to `resendTransport` below. The recipient
 * stays fixed server-side so a visitor to the prototype can never address
 * a stranger.
 */

export interface SendResult {
  ok: boolean;
  mode: "demo" | "live";
  reference: string;
  message: string;
}

export interface SendRecord extends SendResult {
  to: string;
  subject: string;
  lineCount: number;
  totalCases: number;
  at: string;
  /** Carried through so the sent log can show the message, not a stub. */
  body?: string;
  attachmentName?: string;
  draftLabel?: string;
}

let sendCounter = 0;

/**
 * Records the send and returns a reference. No network call is made, and
 * there is no email dependency in the bundle for one to be made with.
 */
export async function demoTransport(email: BuiltEmail): Promise<SendResult> {
  sendCounter += 1;
  const reference = `OS-DEMO-SEND-${String(sendCounter).padStart(4, "0")}`;
  return {
    ok: true,
    mode: "demo",
    reference,
    message: `Recorded as a demonstration. Nothing was transmitted to ${email.to}.`,
  };
}

/** Posts to the server function described above. Not wired up yet. */
export async function resendTransport(email: BuiltEmail): Promise<SendResult> {
  const res = await fetch("/api/send-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  return {
    ok: res.ok,
    mode: "live",
    reference: data.id ?? "unknown",
    message: res.ok
      ? "Sent."
      : `Send failed: ${data.message ?? res.statusText}. Nothing was delivered.`,
  };
}

/** The one line to change when the server function is live. */
export const activeTransport = demoTransport;
export const TRANSPORT_MODE: "demo" | "live" = "demo";
