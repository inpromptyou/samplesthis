import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { sanitize } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rate-limit";

async function sendBookingEmail(to: string, subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[Email] To: ${to}, Subject: ${subject}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Flinchify <noreply@send.flinchify.com>",
      to,
      subject,
      html,
    }),
  });
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql();

    // Check tester auth first
    const testerToken = req.cookies.get("tester_token")?.value;
    const bizToken = req.cookies.get("business_token")?.value;

    if (testerToken) {
      const [tester] = await sql`SELECT id FROM testers WHERE auth_token = ${testerToken}`;
      if (!tester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const bookings = await sql`
        SELECT b.*, o.app_url, o.app_type, o.description as job_description
        FROM bookings b
        JOIN orders o ON o.id = b.order_id
        WHERE b.tester_id = ${tester.id}
        ORDER BY b.scheduled_date ASC, b.scheduled_time ASC
      `;
      return NextResponse.json({ bookings });
    }

    if (bizToken) {
      const [biz] = await sql`SELECT id, email FROM businesses WHERE auth_token = ${bizToken} AND verified = true`;
      if (!biz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const bookings = await sql`
        SELECT b.*, o.app_url, o.app_type, o.description as job_description,
               t.name as tester_name, t.email as tester_email
        FROM bookings b
        JOIN orders o ON o.id = b.order_id
        LEFT JOIN testers t ON t.id = b.tester_id
        WHERE o.email = ${biz.email}
        ORDER BY b.scheduled_date ASC, b.scheduled_time ASC
      `;
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTables();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`booking:${ip}`, 10, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const bizToken = req.cookies.get("business_token")?.value;
    if (!bizToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = getSql();
    const [biz] = await sql`SELECT id, email, company FROM businesses WHERE auth_token = ${bizToken} AND verified = true`;
    if (!biz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { order_id, tester_id, scheduled_date, scheduled_time, duration_minutes, timezone } = body;
    const notes = sanitize(body.notes);

    if (!order_id || !scheduled_date || !scheduled_time) {
      return NextResponse.json({ error: "order_id, scheduled_date, and scheduled_time are required" }, { status: 400 });
    }

    // Verify the order belongs to this business
    const [order] = await sql`SELECT id, app_url, email FROM orders WHERE id = ${order_id} AND email = ${biz.email}`;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Calculate app_ready_deadline: 2 hours before scheduled time
    const scheduledDateTime = new Date(`${scheduled_date}T${scheduled_time}:00`);
    const appReadyDeadline = new Date(scheduledDateTime.getTime() - 2 * 60 * 60 * 1000);

    const dur = Math.max(15, Math.min(120, parseInt(duration_minutes) || 30));
    const tz = sanitize(timezone) || "Australia/Sydney";

    const rows = await sql`
      INSERT INTO bookings (order_id, tester_id, scheduled_date, scheduled_time, timezone, duration_minutes, app_ready_deadline, notes)
      VALUES (${order_id}, ${tester_id || null}, ${scheduled_date}, ${scheduled_time}, ${tz}, ${dur}, ${appReadyDeadline.toISOString()}, ${notes || null})
      RETURNING id
    `;

    // Update order with booking info
    await sql`UPDATE orders SET booking_required = true, booking_deadline = ${appReadyDeadline.toISOString()} WHERE id = ${order_id}`;

    // Send email notification to business
    await sendBookingEmail(
      biz.email,
      `Booking created for ${new Date(scheduled_date).toLocaleDateString("en-AU")}`,
      `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">Booking Created</h2>
        <p style="font-size:14px;color:#555;margin:0 0 8px">A test session has been scheduled for your app.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;font-size:13px"><strong>Date:</strong> ${new Date(scheduled_date).toLocaleDateString("en-AU")}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Time:</strong> ${scheduled_time}</p>
          <p style="margin:4px 0;font-size:13px"><strong>Duration:</strong> ${dur} minutes</p>
          <p style="margin:4px 0;font-size:13px"><strong>App ready by:</strong> ${appReadyDeadline.toLocaleString("en-AU")}</p>
        </div>
        <p style="font-size:12px;color:#999;margin:16px 0 0">— Flinchify</p>
      </div>`
    );

    // If tester assigned, notify them too
    if (tester_id) {
      const [testerRow] = await sql`SELECT email, name FROM testers WHERE id = ${tester_id}`;
      if (testerRow) {
        await sendBookingEmail(
          testerRow.email,
          `You have a test session on ${new Date(scheduled_date).toLocaleDateString("en-AU")}`,
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">New Test Session</h2>
            <p style="font-size:14px;color:#555;margin:0 0 8px">Hi ${sanitize(testerRow.name)}, you've been assigned a test session.</p>
            <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:4px 0;font-size:13px"><strong>Date:</strong> ${new Date(scheduled_date).toLocaleDateString("en-AU")}</p>
              <p style="margin:4px 0;font-size:13px"><strong>Time:</strong> ${scheduled_time}</p>
              <p style="margin:4px 0;font-size:13px"><strong>Duration:</strong> ${dur} minutes</p>
            </div>
            <p style="font-size:14px;color:#555">Please confirm or decline in your dashboard.</p>
            <p style="font-size:12px;color:#999;margin:16px 0 0">— Flinchify</p>
          </div>`
        );
      }
    }

    return NextResponse.json({ success: true, booking_id: rows[0].id });
  } catch (e: unknown) {
    console.error("Booking create error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
