import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    if (!bookingId) return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`booking-update:${ip}`, 20, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const testerToken = req.cookies.get("tester_token")?.value;
    const bizToken = req.cookies.get("business_token")?.value;

    const sql = getSql();
    const body = await req.json();
    const { action } = body;

    // Get the booking
    const [booking] = await sql`
      SELECT b.*, o.email as business_email, o.app_url
      FROM bookings b
      JOIN orders o ON o.id = b.order_id
      WHERE b.id = ${bookingId}
    `;
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    // Tester actions: confirm, cancel
    if (testerToken) {
      const [tester] = await sql`SELECT id, name, email FROM testers WHERE auth_token = ${testerToken}`;
      if (!tester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (booking.tester_id !== tester.id) return NextResponse.json({ error: "Not your booking" }, { status: 403 });

      if (action === "confirm") {
        if (booking.status !== "pending") {
          return NextResponse.json({ error: "Can only confirm pending bookings" }, { status: 400 });
        }
        await sql`UPDATE bookings SET status = 'confirmed', confirmed_at = NOW() WHERE id = ${bookingId}`;

        // Notify business
        await sendBookingEmail(
          booking.business_email,
          `${tester.name} confirmed the test session`,
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="font-size:18px;font-weight:700;margin:0 0 16px">Booking Confirmed</h2>
            <p style="font-size:14px;color:#555;margin:0 0 8px">${sanitize(tester.name)} has confirmed the test session.</p>
            <div style="background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:4px 0;font-size:13px"><strong>Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString("en-AU")}</p>
              <p style="margin:4px 0;font-size:13px"><strong>Time:</strong> ${booking.scheduled_time}</p>
              <p style="margin:4px 0;font-size:13px"><strong>Duration:</strong> ${booking.duration_minutes} minutes</p>
            </div>
            <p style="font-size:14px;color:#555">Make sure your app is ready before the deadline.</p>
            <p style="font-size:12px;color:#999;margin:16px 0 0">— Flinchify</p>
          </div>`
        );

        return NextResponse.json({ success: true, status: "confirmed" });
      }

      if (action === "cancel") {
        if (booking.status === "confirmed") {
          return NextResponse.json({ error: "Cannot cancel a confirmed booking — non-refundable once confirmed" }, { status: 400 });
        }
        if (booking.status !== "pending") {
          return NextResponse.json({ error: "Can only cancel pending bookings" }, { status: 400 });
        }
        await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId}`;
        return NextResponse.json({ success: true, status: "cancelled" });
      }
    }

    // Business actions: mark_ready, complete, cancel, no_show
    if (bizToken) {
      const [biz] = await sql`SELECT id, email FROM businesses WHERE auth_token = ${bizToken} AND verified = true`;
      if (!biz) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (booking.business_email !== biz.email) return NextResponse.json({ error: "Not your booking" }, { status: 403 });

      if (action === "mark_ready") {
        await sql`UPDATE bookings SET app_ready = true WHERE id = ${bookingId}`;
        return NextResponse.json({ success: true, app_ready: true });
      }

      if (action === "complete") {
        if (booking.status !== "confirmed") {
          return NextResponse.json({ error: "Can only complete confirmed bookings" }, { status: 400 });
        }
        const notes = sanitize(body.notes);
        await sql`UPDATE bookings SET status = 'completed', completed_at = NOW(), notes = COALESCE(${notes || null}, notes) WHERE id = ${bookingId}`;
        return NextResponse.json({ success: true, status: "completed" });
      }

      if (action === "cancel") {
        if (booking.status === "confirmed") {
          return NextResponse.json({ error: "Cannot cancel a confirmed booking — non-refundable once confirmed" }, { status: 400 });
        }
        if (booking.status !== "pending") {
          return NextResponse.json({ error: "Can only cancel pending bookings" }, { status: 400 });
        }
        await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId}`;
        return NextResponse.json({ success: true, status: "cancelled" });
      }

      if (action === "no_show") {
        if (booking.status !== "confirmed") {
          return NextResponse.json({ error: "Can only mark confirmed bookings as no-show" }, { status: 400 });
        }
        await sql`UPDATE bookings SET status = 'no_show' WHERE id = ${bookingId}`;
        return NextResponse.json({ success: true, status: "no_show" });
      }
    }

    if (!testerToken && !bizToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: unknown) {
    console.error("Booking update error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
