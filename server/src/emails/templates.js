import { env } from "../config/env.js";

const BRAND = {
  navy: "#0f2a4a",
  accent: "#2f6fed",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
  bg: "#f4f6f8",
  success: "#15803d",
  successBg: "#dcfce7",
  danger: "#b91c1c",
  dangerBg: "#fee2e2",
  warn: "#a16207",
  warnBg: "#fef3c7",
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const siteUrl = () => env.CLIENT_URL.split(",")[0].trim().replace(/\/$/, "");

const money = (amount, currency) =>
  `${currency ?? ""}${Number(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const when = (d = new Date()) =>
  new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

/**
 * Shared shell: hidden preheader (inbox preview text), responsive 600px card,
 * dark-mode friendly colours, footer with security reminder.
 */
const layout = ({ title, preheader = "", body }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${esc(title)}</title>
  <style>
    @media (max-width:620px){ .card{width:100%!important;border-radius:0!important} .pad{padding:24px 20px!important} }
    @media (prefers-color-scheme:dark){
      .bg{background:#0b1220!important}
      .card{background:#111a2c!important}
      .txt{color:#e5e7eb!important}
      .muted{color:#9ca3af!important}
      .rule{border-color:#243049!important}
      .box{background:#18233a!important}
    }
  </style>
</head>
<body class="bg" style="margin:0;padding:0;background:${BRAND.bg};font-family:${FONT};color:${BRAND.text};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(preheader)}${"&nbsp;&zwnj;".repeat(40)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="bg" style="background:${BRAND.bg}">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="card" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,42,74,.12)">
        <tr><td style="background:${BRAND.navy};padding:22px 32px">
          <a href="${esc(siteUrl())}" style="color:#ffffff;text-decoration:none;font-size:19px;font-weight:700;letter-spacing:.2px">${esc(env.BREVO_SENDER_NAME)}</a>
        </td></tr>
        <tr><td class="pad txt" style="padding:32px;color:${BRAND.text};font-size:15px;line-height:1.6">
          <h1 class="txt" style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${BRAND.text}">${esc(title)}</h1>
          ${body}
        </td></tr>
        <tr><td class="pad rule" style="padding:20px 32px;border-top:1px solid ${BRAND.line}">
          <p class="muted" style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${BRAND.muted}">
            <strong>Stay safe:</strong> ${esc(env.BREVO_SENDER_NAME)} will never ask for your password, PIN or verification codes by email, phone or text.
          </p>
          <p class="muted" style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted}">
            This is an automated message, please do not reply. &copy; ${new Date().getFullYear()} ${esc(env.BREVO_SENDER_NAME)}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const p = (html) => `<p style="margin:0 0 16px">${html}</p>`;

/** Bulletproof button (works in Outlook) plus a copy-paste fallback link. */
const button = (href, label) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 8px"><tr>
    <td align="center" bgcolor="${BRAND.accent}" style="border-radius:8px">
      <a href="${esc(href)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background:${BRAND.accent}">${esc(label)}</a>
    </td>
  </tr></table>
  <p class="muted" style="margin:12px 0 0;font-size:12px;color:${BRAND.muted};word-break:break-all">Button not working? Paste this link into your browser:<br><a href="${esc(href)}" style="color:${BRAND.accent}">${esc(href)}</a></p>`;

const notice = (html, tone = "warn") => {
  const [bg, fg] = tone === "danger" ? [BRAND.dangerBg, BRAND.danger] : [BRAND.warnBg, BRAND.warn];
  return `<div style="margin:20px 0 0;padding:12px 14px;border-radius:8px;background:${bg};color:${fg};font-size:13px;line-height:1.5">${html}</div>`;
};

const badge = (label, tone) => {
  const [bg, fg] =
    tone === "success" ? [BRAND.successBg, BRAND.success] : tone === "danger" ? [BRAND.dangerBg, BRAND.danger] : [BRAND.warnBg, BRAND.warn];
  return `<span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${bg};color:${fg};font-size:12px;font-weight:700;text-transform:capitalize">${esc(label)}</span>`;
};

const detailRows = (rows) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0">${rows
    .map(
      ([k, v, raw], i) => `
    <tr>
      <td class="muted rule" style="padding:11px 0;${i ? `border-top:1px solid ${BRAND.line};` : ""}color:${BRAND.muted};font-size:14px">${esc(k)}</td>
      <td class="rule" style="padding:11px 0;${i ? `border-top:1px solid ${BRAND.line};` : ""}text-align:right;font-size:14px;font-weight:600">${raw ? v : esc(v)}</td>
    </tr>`,
    )
    .join("")}</table>`;

export function welcomeEmail({ name }) {
  const first = String(name ?? "").trim().split(/\s+/)[0] || "there";
  return {
    subject: `Welcome to ${env.BREVO_SENDER_NAME}, ${first}`,
    html: layout({
      title: `Welcome, ${first}`,
      preheader: "Your account has been created and is awaiting activation.",
      body:
        p("Thank you for choosing us. Your account has been created successfully.") +
        `<div class="box" style="margin:0 0 16px;padding:16px;border-radius:8px;background:#f8fafc">
          <p style="margin:0 0 8px;font-weight:700">What happens next</p>
          <ol style="margin:0;padding-left:20px;color:${BRAND.text}">
            <li style="margin-bottom:6px">Our team reviews your details and activates your account, usually shortly.</li>
            <li style="margin-bottom:6px">You will be able to sign in, view your balance and make transfers.</li>
            <li>Keep your transaction PIN private. We never ask for it.</li>
          </ol>
        </div>` +
        button(`${siteUrl()}/login`, "Go to sign in"),
    }),
    text: `Welcome, ${first}!\n\nYour account has been created. Our team will review and activate it shortly. Once it is active you can sign in at ${siteUrl()}/login.\n\n${env.BREVO_SENDER_NAME} will never ask for your password or PIN.`,
  };
}

export function resetPasswordEmail({ name, link, minutes, reason }) {
  const invite = reason === "invite";
  const title = invite ? "Set your password" : "Reset your password";
  const intro = invite
    ? "An account has been created for you. Choose a password to get started."
    : "We received a request to reset the password on your account. Use the button below to choose a new one.";
  return {
    subject: invite ? `Set your ${env.BREVO_SENDER_NAME} password` : `Reset your ${env.BREVO_SENDER_NAME} password`,
    html: layout({
      title,
      preheader: `This link expires in ${minutes} minutes.`,
      body:
        p(`Hi ${esc(name)},`) +
        p(esc(intro)) +
        button(link, invite ? "Set my password" : "Reset my password") +
        p(`<span class="muted" style="font-size:13px;color:${BRAND.muted}">For your security this link expires in <strong>${esc(minutes)} minutes</strong> and can be used only once.</span>`) +
        (invite ? "" : notice("<strong>Didn't ask for this?</strong> You can ignore this email, your password will not change. If you keep receiving these, contact support.")),
    }),
    text: `Hi ${name},\n\n${intro}\n\n${link}\n\nThis link expires in ${minutes} minutes and can be used only once.${invite ? "" : "\nIf you did not request this, ignore this email and your password will stay the same."}`,
  };
}

export function passwordChangedEmail({ name }) {
  return {
    subject: `Your ${env.BREVO_SENDER_NAME} password was changed`,
    html: layout({
      title: "Password changed",
      preheader: "Your password was just updated. All other sessions were signed out.",
      body:
        p(`Hi ${esc(name)},`) +
        p(`The password on your account was changed on <strong>${esc(when())}</strong>. For your protection, all other devices have been signed out.`) +
        notice("<strong>Wasn't you?</strong> Reset your password immediately and contact support.", "danger") +
        button(`${siteUrl()}/forgot-password`, "Secure my account"),
    }),
    text: `Hi ${name},\n\nThe password on your account was changed on ${when()}. All other devices were signed out.\n\nIf this wasn't you, reset your password right away: ${siteUrl()}/forgot-password and contact support.`,
  };
}

export function transactionEmail({ name, type, amount, currency, status, reference, balance }) {
  const credit = type === "credit";
  const amt = money(amount, currency);
  const tone = status === "success" ? "success" : status === "failed" ? "danger" : "warn";
  const heading = credit ? "Credit alert" : "Debit alert";
  return {
    subject: `${heading}: ${credit ? "+" : "-"}${amt}`,
    html: layout({
      title: heading,
      preheader: `${credit ? "Received" : "Sent"} ${amt}. Status: ${status}. Ref ${reference}.`,
      body:
        p(`Hi ${esc(name)}, a transaction was recorded on your account.`) +
        `<div class="box" style="margin:0 0 8px;padding:20px;border-radius:10px;background:#f8fafc;text-align:center">
          <div class="muted" style="font-size:13px;color:${BRAND.muted};margin-bottom:4px">${credit ? "Amount received" : "Amount sent"}</div>
          <div style="font-size:32px;font-weight:700;color:${credit ? BRAND.success : BRAND.text}">${credit ? "+" : "-"}${esc(amt)}</div>
          <div style="margin-top:10px">${badge(status, tone)}</div>
        </div>` +
        detailRows([
          ["Type", credit ? "Credit" : "Debit"],
          ["Reference", reference],
          ["Date", when()],
          ["Available balance", money(balance, currency)],
        ]) +
        button(`${siteUrl()}/dashboard`, "View my account") +
        notice("<strong>Don't recognise this?</strong> Contact support immediately and change your password.", "danger"),
    }),
    text: `Hi ${name},\n\n${heading}: ${credit ? "+" : "-"}${amt} (${status})\nReference: ${reference}\nDate: ${when()}\nAvailable balance: ${money(balance, currency)}\n\nView your account: ${siteUrl()}/dashboard\nDon't recognise this? Contact support and change your password.`,
  };
}
