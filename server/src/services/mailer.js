import { env } from "../config/env.js";

// The Brevo SDK is very large and slow to import (tens of seconds on Windows), so it is
// loaded lazily and warmed up in the background after the server starts listening.
let clientPromise = null;
export function getBrevo() {
  if (!env.BREVO_API_KEY) return Promise.resolve(null);
  clientPromise ??= import("@getbrevo/brevo").then(({ BrevoClient }) => new BrevoClient({ apiKey: env.BREVO_API_KEY }));
  return clientPromise;
}

/**
 * Sends a transactional email through Brevo. Never throws: email problems must not
 * fail the request that triggered them. Returns true when the message was accepted.
 */
export async function sendMail({ to, name, subject, html, text }) {
  const brevo = env.BREVO_SENDER_EMAIL ? await getBrevo().catch(() => null) : null;
  if (!brevo) {
    console.warn(`[mailer] Brevo not configured, skipped email "${subject}" to ${to}`);
    if (env.NODE_ENV !== "production" && text) console.warn(`[mailer] ${text}`);
    return false;
  }
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      textContent: text,
      sender: { name: env.BREVO_SENDER_NAME, email: env.BREVO_SENDER_EMAIL },
      to: [{ email: to, name }],
    });
    return true;
  } catch (err) {
    console.error(`[mailer] Failed to send "${subject}" to ${to}:`, err?.message ?? err);
    return false;
  }
}
