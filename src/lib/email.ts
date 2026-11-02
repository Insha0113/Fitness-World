import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Fitness World <onboarding@resend.dev>";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Send a transactional email. Never throws: a failed notification must not
 * fail the user's request (the lead/payment is already saved).
 */
export async function sendEmail(to: string | string[], subject: string, html: string) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ")}`);
    } else {
      console.warn("[email] RESEND_API_KEY not set — email not sent:", subject);
    }
    return { ok: false };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed:", subject, e);
    return { ok: false };
  }
}

function adminRecipients() {
  return (process.env.ADMIN_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function notifyAdmin(subject: string, rows: Record<string, string | null | undefined>, link?: string) {
  const to = adminRecipients();
  if (!to.length) return { ok: false };
  const table = Object.entries(rows)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(String(v))}</td></tr>`)
    .join("");
  const base = process.env.NEXTAUTH_URL ?? "";
  return sendEmail(
    to,
    subject,
    `<div style="font-family:system-ui,sans-serif"><h2>${esc(subject)}</h2><table>${table}</table>${
      link ? `<p><a href="${base}${link}">Open in admin dashboard</a></p>` : ""
    }</div>`
  );
}

export { esc };
