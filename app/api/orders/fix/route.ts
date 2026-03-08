import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

// GET: sync all pending_payment orders with Stripe (no auth needed — only marks paid if Stripe confirms)
export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const sql = getSql();
  const pending = await sql`SELECT id, stripe_session_id FROM orders WHERE status = 'pending_payment' AND stripe_session_id IS NOT NULL`;
  
  const stripe = (await import("stripe")).default;
  const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
  const fixed: number[] = [];
  
  for (const order of pending) {
    try {
      const session = await stripeClient.checkout.sessions.retrieve(order.stripe_session_id);
      if (session.payment_status === "paid") {
        await sql`UPDATE orders SET status = 'paid' WHERE id = ${order.id}`;
        fixed.push(order.id);
      }
    } catch { /* skip */ }
  }
  
  return NextResponse.json({ synced: fixed.length, fixed_order_ids: fixed, total_pending: pending.length });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-key");
  if (secret !== (process.env.ADMIN_SECRET || "flinchify-admin-2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { order_id } = await req.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });
  
  const sql = getSql();
  
  // If we have Stripe key, verify payment first
  if (process.env.STRIPE_SECRET_KEY) {
    const [order] = await sql`SELECT stripe_session_id FROM orders WHERE id = ${order_id}`;
    if (order?.stripe_session_id) {
      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripeClient.checkout.sessions.retrieve(order.stripe_session_id);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not confirmed in Stripe", status: session.payment_status }, { status: 400 });
      }
    }
  }
  
  await sql`UPDATE orders SET status = 'paid' WHERE id = ${order_id}`;
  return NextResponse.json({ success: true, order_id });
}
