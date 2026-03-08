import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { getTester } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const tester = await getTester();
    if (!tester) {
      return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
    }

    if (!tester.stripe_onboarded || !tester.stripe_account_id) {
      return NextResponse.json({ error: "Set up payouts before applying. Go to Dashboard → Payouts to connect your bank account." }, { status: 400 });
    }

    const { order_id, note } = await req.json();
    if (!order_id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const sql = getSql();

    // Check job exists and is paid
    const job = await sql`SELECT * FROM orders WHERE id = ${order_id} AND status = 'paid'`;
    if (job.length === 0) {
      return NextResponse.json({ error: "Job not found or not active" }, { status: 404 });
    }

    // Check if already applied
    const existing = await sql`SELECT id FROM applications WHERE order_id = ${order_id} AND tester_id = ${tester.id}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "You've already applied to this job" }, { status: 409 });
    }

    // Check if job is full
    const accepted = await sql`SELECT COUNT(*)::int as count FROM applications WHERE order_id = ${order_id} AND status = 'accepted'`;
    if (accepted[0].count >= job[0].testers_count) {
      return NextResponse.json({ error: "This job is full" }, { status: 400 });
    }

    await sql`
      INSERT INTO applications (order_id, tester_id, note, status)
      VALUES (${order_id}, ${tester.id}, ${note || null}, 'pending')
    `;

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Application failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
