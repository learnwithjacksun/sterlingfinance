import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

/** Sends an SMS through Infobip from the server (the key used to ship in the admin bundle). */
export async function sendSms({ to, text }) {
  if (!env.INFOBIP_API_KEY) throw new ApiError(503, "SMS_UNAVAILABLE", "SMS is not configured");

  const res = await fetch(`${env.INFOBIP_BASE_URL}/sms/2/text/advanced`, {
    method: "POST",
    headers: {
      Authorization: `App ${env.INFOBIP_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      messages: [{ destinations: [{ to: String(to).replace(/[^\d+]/g, "") }], from: env.INFOBIP_SENDER, text }],
    }),
  });
  if (!res.ok) {
    console.error("[sms] Infobip error", res.status, await res.text().catch(() => ""));
    throw new ApiError(502, "SMS_FAILED", "Could not send SMS");
  }
  return true;
}
