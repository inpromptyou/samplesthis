import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT ak.tester_id, t.email FROM api_keys ak JOIN testers t ON t.id = ak.tester_id
    WHERE ak.key = ${key} AND ak.revoked = false
  `;
  if (!rows.length) return null;
  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE key = ${key}`;
  return rows[0];
}

// GET /api/v1/tests/:id — Get test details + results
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTables();
    const user = await authenticateApiKey(req);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Strip ft_ prefix if present
    const orderId = id.replace(/^ft_/, "");

    const sql = getSql();
    const rows = await sql`
      SELECT id, app_url, description, target_audience, testers_count,
             price_per_tester_cents, status, test_mode, tasks,
             time_limit_hours, created_at
      FROM orders WHERE id = ${parseInt(orderId)} AND email = ${user.email}
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "not_found", message: "Test not found" }, { status: 404 });
    }

    const order = rows[0];

    // Get applications/results
    const apps = await sql`
      SELECT a.id, a.status, a.created_at, a.feedback, a.recording_url,
             t.name as tester_name, t.country as tester_country
      FROM applications a LEFT JOIN testers t ON t.id = a.tester_id
      WHERE a.order_id = ${order.id}
      ORDER BY a.created_at ASC
    `;

    const issues: { severity: string; description: string; tester: string }[] = [];
    const recordings: string[] = [];

    for (const app of apps) {
      if (app.recording_url) recordings.push(app.recording_url);
      if (app.feedback) {
        issues.push({
          severity: "medium",
          description: app.feedback,
          tester: app.tester_name || "Anonymous",
        });
      }
    }

    return NextResponse.json({
      test_id: `ft_${order.id}`,
      url: order.app_url,
      description: order.description,
      target_audience: order.target_audience,
      testers_requested: order.testers_count,
      budget_per_tester: order.price_per_tester_cents / 100,
      status: order.status,
      test_mode: order.test_mode,
      tasks: order.tasks ? JSON.parse(order.tasks) : [],
      time_limit_hours: order.time_limit_hours,
      created_at: order.created_at,
      results: {
        testers_applied: apps.length,
        testers_accepted: apps.filter(a => a.status === "accepted").length,
        testers_completed: apps.filter(a => a.status === "completed").length,
        issues,
        recordings,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: "server", message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
