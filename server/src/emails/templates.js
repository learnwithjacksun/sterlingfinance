import { env } from "../config/env.js";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const layout = (title, body) => `<!doctype html>
<html><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden" cellspacing="0" cellpadding="0">
      <tr><td style="background:#0f2a4a;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold">${esc(env.BREVO_SENDER_NAME)}</td></tr>
      <tr><td style="padding:24px"><h2 style="margin:0 0 16px;font-size:20px">${esc(title)}</h2>${body}</td></tr>
      <tr><td style="padding:16px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb">If you did not expect this email you can safely ignore it.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

const button = (href, label) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#0f2a4a;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;display:inline-block">${esc(label)}</a></p>
   <p style="font-size:13px;color:#6b7280">Or paste this link into your browser:<br>${esc(href)}</p>`;

export function welcomeEmail({ name }) {
  return {
    subject: `Welcome to ${env.BREVO_SENDER_NAME}`,
    html: layout(
      `Welcome, ${name}`,
      `<p>Your account has been created. Our team will review and activate it shortly.</p>`,
    ),
    text: `Welcome, ${name}. Your account has been created and will be activated shortly.`,
  };
}

export function resetPasswordEmail({ name, link, minutes, reason }) {
  const intro =
    reason === "invite"
      ? "An account has been created for you. Set your password to get started."
      : "We received a request to reset your password.";
  return {
    subject: reason === "invite" ? "Set your password" : "Reset your password",
    html: layout(
      reason === "invite" ? "Set your password" : "Reset your password",
      `<p>Hi ${esc(name)},</p><p>${esc(intro)}</p>${button(link, "Set new password")}<p style="font-size:13px">This link expires in ${minutes} minutes and can only be used once.</p>`,
    ),
    text: `Hi ${name}, ${intro} Open ${link} (valid for ${minutes} minutes).`,
  };
}

export function transactionEmail({ name, type, amount, currency, status, reference, balance }) {
  const money = `${currency ?? ""}${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const rows = [
    ["Type", type === "credit" ? "Credit" : "Debit"],
    ["Amount", money],
    ["Status", status],
    ["Reference", reference],
    ["Balance", `${currency ?? ""}${Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#6b7280">${esc(k)}</td><td style="padding:6px 0;text-align:right;font-weight:bold">${esc(v)}</td></tr>`,
    )
    .join("");
  return {
    subject: `${type === "credit" ? "Credit" : "Debit"} alert: ${money}`,
    html: layout("Transaction alert", `<p>Hi ${esc(name)}, a transaction occurred on your account.</p><table width="100%">${rows}</table>`),
    text: `Hi ${name}, a ${type} of ${money} (${status}) occurred on your account. Ref ${reference}.`,
  };
}
