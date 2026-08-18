/**
 * THE THREE THINGS THAT CAN HONESTLY HAPPEN TO A DRAFT IN A STATIC BUILD.
 *
 * This app is a bundle of static files. There is no server, so there is no
 * safe place to hold a key that could send mail, and there is therefore no
 * transport anywhere in this dependency tree. That constraint is not a gap
 * to paper over, it is the thing this file is organised around.
 *
 * ── ONE. HAND THE LETTER TO THE PERSON'S OWN MAIL CLIENT ───────────
 * A `mailto:` sends nothing. It opens a compose window in whatever the
 * reader already uses, with the subject and the body already in it, and
 * the human presses send or does not. That is the only route in this build
 * where a real published address is safe to use, because the decision to
 * send stays with a person who can read the message first.
 *
 * The catch is length. A `mailto:` is a URL, and a URL travels through the
 * operating system's handler registry before it reaches a mail client.
 * Windows historically truncated at 2083 characters and several clients
 * still silently drop everything past roughly two thousand, so a long body
 * arrives cut off mid sentence with no warning to anybody. A truncated
 * letter is worse than no letter, so the length is measured before the
 * link is offered and the fallback is the clipboard.
 *
 * ── TWO. THE CLIPBOARD ─────────────────────────────────────────────
 * Whole message, subject line included, into whatever the reader wants to
 * paste it into. The async API is refused outside a secure context and in
 * several embedded browsers, so there is a second path through a hidden
 * textarea and `document.execCommand`, which is deprecated and still the
 * only thing that works in those places.
 *
 * ── THREE. THE ONE THAT IS NOT WIRED, AND SAYS SO ──────────────────
 * `resendRequest` builds the exact HTTP request this app would make if it
 * had somewhere to keep an API key. It is built, it is shown, and it is
 * never fired. Shipping the request shape and a disabled control is worth
 * more than a fake success toast: it says what the integration would be,
 * and it says why it is not there, and neither claim needs to be believed
 * on trust because the code is right here.
 */

/**
 * The point past which a `mailto:` stops being reliable.
 *
 * Two thousand and eighty three is the documented Windows ceiling for the
 * whole URL. The budget here is deliberately under it, because the scheme,
 * the address and the query keys all spend from the same allowance and
 * because a client that truncates gives no sign that it has done so.
 */
export const MAILTO_SAFE_LIMIT = 1900;

export interface MailtoPlan {
  /** The full href, or null where there is no published address to use. */
  href: string | null;
  /** The published address this would open against. */
  address: string | null;
  /** Characters in the encoded href. The number the limit is measured on. */
  length: number;
  /** False where the href is long enough that a client may truncate it. */
  withinLimit: boolean;
}

/**
 * The `mailto:` for one draft, and the measurement that decides whether it
 * is offered.
 *
 * Percent encoding is not optional here and it is the part that is easy to
 * get wrong. A body carries blank lines between paragraphs, and a raw
 * newline in a URL is either dropped or treated as the end of the value
 * depending on who parses it. Ampersands in a subject line are worse: an
 * unencoded one ends the subject and starts a parameter the client does
 * not recognise, so half the subject silently disappears.
 */
export function mailtoPlan(
  address: string | null | undefined,
  subject: string,
  body: string,
): MailtoPlan {
  if (!address) {
    return { href: null, address: null, length: 0, withinLimit: false };
  }
  const href = `mailto:${encodeURIComponent(address).replace(/%40/g, "@")}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
  return {
    href,
    address,
    length: href.length,
    withinLimit: href.length <= MAILTO_SAFE_LIMIT,
  };
}

/**
 * Subject and body as one block of text, which is what a person means when
 * they press copy on a letter.
 *
 * The subject is labelled rather than run into the first line, because a
 * message pasted into a mail client needs the subject to be liftable out
 * of it again.
 */
export function letterAsText(subject: string, body: string): string {
  return `Subject: ${subject}\n\n${body}`;
}

/**
 * Copy, through whichever route the browser allows.
 *
 * The `execCommand` fallback is deprecated and still necessary. It is the
 * only clipboard route that works over plain HTTP, inside some app
 * webviews, and in a couple of privacy configurations that switch the
 * async API off entirely. The textarea is positioned off screen rather
 * than hidden, because a `display: none` element cannot be selected and
 * the copy silently does nothing.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Falls through to the older route rather than failing here. A refusal
       from the async API says nothing about whether the old one works. */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// =================================================================
// THE REQUEST THIS APP WOULD SEND IF IT COULD
// =================================================================

export interface ResendRequest {
  method: "POST";
  url: string;
  headers: Record<string, string>;
  body: {
    from: string;
    to: string[];
    subject: string;
    text: string;
  };
}

/**
 * Resend's own documented shape, filled in with the draft on screen.
 *
 * The authorisation header carries a placeholder rather than a key, and
 * that placeholder is the whole point of the control it sits behind. A
 * static site has exactly one place to keep a secret, which is the
 * JavaScript bundle, and a key in a bundle is a key anybody can read out
 * of view source and use to send mail as the owner until it is rotated.
 * Real sending needs a server function holding the key, and this app has
 * no server, so the button is disabled and this object is what it would
 * have posted.
 */
export function resendRequest(
  subject: string,
  body: string,
  to: string,
  from = "sales@mainevent-brea.invalid",
): ResendRequest {
  return {
    method: "POST",
    url: "https://api.resend.com/emails",
    headers: {
      Authorization: "Bearer RESEND_API_KEY_NOT_CONFIGURED",
      "Content-Type": "application/json",
    },
    body: { from, to: [to], subject, text: body },
  };
}

/** The same object as a reader would want to look at it. */
export function resendRequestPreview(req: ResendRequest): string {
  return `${req.method} ${req.url}
Authorization: ${req.headers.Authorization}
Content-Type: ${req.headers["Content-Type"]}

${JSON.stringify(req.body, null, 2)}`;
}
