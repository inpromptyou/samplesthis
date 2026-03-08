import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { ok } = rateLimit(`login:${ip}`, 5, 60_000); // 5 attempts per minute
  if (!ok) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  const sql = getSql();
  const { action, email, code } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const emailLower = email.toLowerCase();

  if (action === "send") {
    // Check tester exists
    const [tester] = await sql`SELECT id, name FROM testers WHERE email = ${emailLower}`;
    if (!tester) {
      return NextResponse.json({ error: "No account found with this email. Sign up instead?" }, { status: 404 });
    }

    // Generate 6-digit code, store in a simple way (reuse verify fields or add to tester)
    const verifyCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sql`UPDATE testers SET verify_code = ${verifyCode}, verify_expires = ${expiresAt.toISOString()} WHERE id = ${tester.id}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Flinchify <noreply@flinchify.com>",
            to: emailLower,
            subject: `Your Flinchify login code: ${verifyCode}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 0;">
                <p style="font-size: 14px; color: #555;">Hey ${tester.name}, here's your login code:</p>
                <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111; margin: 16px 0;">${verifyCode}</p>
                <p style="font-size: 13px; color: #888;">This code expires in 10 minutes.</p>
                <p style="font-size: 13px; color: #888; margin-top: 24px;">If you didn't request this, ignore this email.</p>
              </div>
            `,
          }),
        });
      } catch (e) {
        console.error("Login email failed:", e);
      }
    } else {
      console.log(`[DEV] Login code for ${emailLower}: ${verifyCode}`);
    }

    return NextResponse.json({ sent: true });
  }

  if (action === "verify") {
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const [tester] = await sql`
      SELECT * FROM testers 
      WHERE email = ${emailLower} AND verify_code = ${code} AND verify_expires > NOW()
    `;

    if (!tester) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

    // Generate new auth token
    const token = generateToken();
    await sql`UPDATE testers SET auth_token = ${token}, verify_code = NULL WHERE id = ${tester.id}`;

    const res = NextResponse.json({ success: true, id: tester.id });
    res.cookies.set("tester_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 14, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
