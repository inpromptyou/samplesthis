import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

// GET: list applicants for a specific order (only the job poster can see)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (!orderId) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const token = req.cookies.get("tester_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = getSql();
    const [user] = await sql`SELECT id, email FROM testers WHERE auth_token = ${token}`;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify this order belongs to the user
    const [order] = await sql`SELECT id, email, testers_count, time_limit_hours FROM orders WHERE id = ${orderId}`;
    if (!order || order.email !== user.email) return NextResponse.json({ error: "Not your job" }, { status: 403 });

    const applicants = await sql`
      SELECT a.id, a.status, a.note, a.created_at, a.feedback, a.screen_recording_url, a.submitted_at, a.payout_cents,
             a.deadline_at, a.accepted_at, a.rating, a.rating_comment, a.rated_at,
             t.id as tester_id, t.name, t.email, t.location, t.country, t.bio, t.devices, t.interests,
             t.tests_completed, t.avg_rating, t.linkedin, t.portfolio, t.twitter, t.github
      FROM applications a
      JOIN testers t ON t.id = a.tester_id
      WHERE a.order_id = ${orderId}
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ applicants, testers_count: order.testers_count });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// PATCH: accept or deny an applicant
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (!orderId) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const token = req.cookies.get("tester_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = getSql();
    const [user] = await sql`SELECT id, email FROM testers WHERE auth_token = ${token}`;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [order] = await sql`SELECT id, email, testers_count, time_limit_hours FROM orders WHERE id = ${orderId}`;
    if (!order || order.email !== user.email) return NextResponse.json({ error: "Not your job" }, { status: 403 });

    const { application_id, action } = await req.json();
    if (!application_id || !["accept", "deny"].includes(action)) {
      return NextResponse.json({ error: "application_id and action (accept/deny) required" }, { status: 400 });
    }

    const [app] = await sql`SELECT id, status, tester_id FROM applications WHERE id = ${application_id} AND order_id = ${orderId}`;
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    if (action === "accept") {
      const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM applications WHERE order_id = ${orderId} AND status = 'accepted'`;
      if (count >= order.testers_count) {
        return NextResponse.json({ error: "All tester spots are filled" }, { status: 400 });
      }
      // Set deadline based on order's time_limit_hours
      const timeLimitHours = order.time_limit_hours || 24;
      const deadlineAt = new Date(Date.now() + timeLimitHours * 60 * 60 * 1000);
      await sql`UPDATE applications SET status = 'accepted', accepted_at = NOW(), deadline_at = ${deadlineAt.toISOString()} WHERE id = ${application_id}`;

      // Notify tester
      const [tester] = await sql`SELECT email, name FROM testers WHERE id = ${app.tester_id}`;
      if (tester && process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Flinchify <noreply@flinchify.com>",
            to: tester.email,
            subject: "You've been accepted for a test job!",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="font-size:18px;font-weight:700">You're in!</h2>
              <p style="font-size:14px;color:#555">Hi ${tester.name}, your application has been accepted. Head to your dashboard to get started.</p>
              <p style="font-size:12px;color:#999;margin-top:16px">— Flinchify</p></div>`,
          }),
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, status: "accepted" });
    }

    if (action === "deny") {
      await sql`UPDATE applications SET status = 'rejected' WHERE id = ${application_id}`;
      return NextResponse.json({ success: true, status: "rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
