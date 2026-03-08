import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

// GET: list orders posted by the logged-in user (by email match)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tester_token")?.value;
    if (!token) {
      return NextResponse.json({ orders: [], error: "Not logged in" }, { status: 401 });
    }

    const sql = getSql();
    const [user] = await sql`SELECT id, email FROM testers WHERE auth_token = ${token}`;
    if (!user) {
      return NextResponse.json({ orders: [], error: "Not logged in" }, { status: 401 });
    }

    // Find orders by this user's email (covers both old business posts and new unified posts)
    const orders = await sql`
      SELECT id, app_url, app_type, description, target_audience, testers_count, 
             price_cents, price_per_tester_cents, status, created_at,
             (SELECT COUNT(*)::int FROM applications WHERE order_id = orders.id) as applications_count,
             (SELECT COUNT(*)::int FROM applications WHERE order_id = orders.id AND status = 'accepted') as accepted_count
      FROM orders 
      WHERE email = ${user.email}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch (e: unknown) {
    return NextResponse.json({ orders: [], error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
