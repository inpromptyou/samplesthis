import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

// POST: send verification code or verify code
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { ok } = rateLimit(`biz-verify:${ip}`, 5, 60_000);
  if (!ok) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  await ensureTables();
  const sql = getSql();
  const { action, email, code, company } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const emailLower = email.toLowerCase();

  if (action === "send") {
    // Generate 6-digit code
    const verifyCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert business record
    const existing = await sql`SELECT id FROM businesses WHERE email = ${emailLower}`;
    if (existing.length > 0) {
      await sql`UPDATE businesses SET verify_code = ${verifyCode}, verify_expires = ${expiresAt.toISOString()} WHERE email = ${emailLower}`;
    } else {
      await sql`INSERT INTO businesses (email, company, verify_code, verify_expires) VALUES (${emailLower}, ${company || null}, ${verifyCode}, ${expiresAt.toISOString()})`;
    }

    // Send email via Resend if available, otherwise log
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Flinchify <noreply@flinchify.com>",
            to: emailLower,
            subject: `Your Flinchify verification code: ${verifyCode}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 0;">
                <p style="font-size: 14px; color: #555;">Your verification code is:</p>
                <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111; margin: 16px 0;">${verifyCode}</p>
                <p style="font-size: 13px; color: #888;">This code expires in 10 minutes.</p>
                <p style="font-size: 13px; color: #888; margin-top: 24px;">If you didn't request this, ignore this email.</p>
              </div>
            `,
          }),
        });
        if (!emailRes.ok) {
          const errData = await emailRes.json().catch(() => ({}));
          console.error("Resend error:", emailRes.status, errData);
          return NextResponse.json({ sent: true, emailWarning: `Email may not have sent: ${errData.message || emailRes.status}` });
        }
      } catch (e) {
        console.error("Email send failed:", e);
        return NextResponse.json({ sent: true, emailWarning: "Email delivery failed — check Resend config" });
      }
    } else {
      console.log(`[DEV] Verification code for ${emailLower}: ${verifyCode}`);
      return NextResponse.json({ sent: true, emailWarning: "RESEND_API_KEY not configured" });
    }

    return NextResponse.json({ sent: true });
  }

  if (action === "verify") {
    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const [biz] = await sql`
      SELECT * FROM businesses 
      WHERE email = ${emailLower} AND verify_code = ${code} AND verify_expires > NOW()
    `;

    if (!biz) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

    // Mark verified, generate auth token
    const token = crypto.randomBytes(32).toString("hex");
    await sql`
      UPDATE businesses SET 
        verified = true, 
        auth_token = ${token}, 
        company = COALESCE(${company || null}, company),
        verify_code = NULL
      WHERE id = ${biz.id}
    `;

    const res = NextResponse.json({ verified: true, id: biz.id });
    res.cookies.set("business_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 14, path: "/" });
    return res;
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
