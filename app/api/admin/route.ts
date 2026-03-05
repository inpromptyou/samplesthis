import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

const ADMIN_KEY = process.env.ADMIN_SECRET || "flinchify-admin-2026";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("x-admin-key");
  return auth === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();
  const sql = getSql();
  const tab = req.nextUrl.searchParams.get("tab") || "overview";

  if (tab === "overview") {
    const [testersCount] = await sql`SELECT COUNT(*)::int as count FROM testers`;
    const [ordersCount] = await sql`SELECT COUNT(*)::int as count FROM orders`;
    const [paidCount] = await sql`SELECT COUNT(*)::int as count FROM orders WHERE status = 'paid'`;
    const [pendingCount] = await sql`SELECT COUNT(*)::int as count FROM orders WHERE status = 'pending_payment'`;
    const [appsCount] = await sql`SELECT COUNT(*)::int as count FROM applications`;
    const [revenue] = await sql`SELECT COALESCE(SUM(price_cents), 0)::int as total FROM orders WHERE status = 'paid'`;

    return NextResponse.json({
      stats: {
        totalTesters: testersCount.count,
        totalOrders: ordersCount.count,
        paidOrders: paidCount.count,
        pendingOrders: pendingCount.count,
        totalApplications: appsCount.count,
        totalRevenue: revenue.total,
      },
    });
  }

  if (tab === "orders") {
    const orders = await sql`
      SELECT o.*, 
        (SELECT COUNT(*)::int FROM applications WHERE order_id = o.id) as apps_count,
        (SELECT COUNT(*)::int FROM applications WHERE order_id = o.id AND status = 'accepted') as accepted_count
      FROM orders o ORDER BY o.created_at DESC LIMIT 100
    `;
    return NextResponse.json({ orders });
  }

  if (tab === "testers") {
    const testers = await sql`
      SELECT t.*,
        (SELECT COUNT(*)::int FROM applications WHERE tester_id = t.id) as total_apps,
        (SELECT COUNT(*)::int FROM applications WHERE tester_id = t.id AND status = 'accepted') as accepted_apps
      FROM testers t ORDER BY t.created_at DESC LIMIT 100
    `;
    return NextResponse.json({ testers });
  }

  if (tab === "applications") {
    const apps = await sql`
      SELECT a.*, 
        t.name as tester_name, t.email as tester_email, t.location as tester_location,
        o.app_url, o.description as job_description, o.price_per_tester_cents
      FROM applications a
      JOIN testers t ON a.tester_id = t.id
      JOIN orders o ON a.order_id = o.id
      ORDER BY a.created_at DESC LIMIT 100
    `;
    return NextResponse.json({ applications: apps });
  }

  return NextResponse.json({ error: "Unknown tab" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();
  const sql = getSql();
  const { type, id, status } = await req.json();

  if (type === "order" && id && status) {
    await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  if (type === "tester" && id && status) {
    await sql`UPDATE testers SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  if (type === "application" && id && status) {
    await sql`UPDATE applications SET status = ${status} WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();
  const sql = getSql();
  const { type, id } = await req.json();

  if (type === "tester" && id) {
    await sql`DELETE FROM applications WHERE tester_id = ${id}`;
    await sql`DELETE FROM testers WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  if (type === "order" && id) {
    await sql`DELETE FROM applications WHERE order_id = ${id}`;
    await sql`DELETE FROM orders WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  if (type === "application" && id) {
    await sql`DELETE FROM applications WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
