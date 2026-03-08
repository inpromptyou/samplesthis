import { NextResponse } from "next/server";

export async function GET() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Flinchify <noreply@send.flinchify.com>",
        to: "inpromptyou@gmail.com",
        subject: "Flinchify Email Test",
        html: "<p>If you see this, email is working!</p>",
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      response: data,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Unknown error",
    });
  }
}
