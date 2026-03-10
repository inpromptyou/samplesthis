import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { sanitize, isValidUrl } from "@/lib/sanitize";

// Ensure api_keys table
async function ensureApiKeys() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      tester_id INT NOT NULL REFERENCES testers(id),
      name TEXT DEFAULT 'default',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      revoked BOOLEAN DEFAULT false
    )
  `;
}

// Auth via API key
async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key) return null;

  const sql = getSql();
  await ensureApiKeys();

  const rows = await sql`
    SELECT ak.id as key_id, ak.tester_id, t.email, t.name, t.currency
    FROM api_keys ak JOIN testers t ON t.id = ak.tester_id
    WHERE ak.key = ${key} AND ak.revoked = false
  `;
  if (!rows.length) return null;

  // Update last used
  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].key_id}`;
  return rows[0];
}

// POST /api/v1/tests — Create a test
export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const user = await authenticateApiKey(req);
    if (!user) {
      return NextResponse.json({
        error: "unauthorized",
        message: "Invalid or missing API key. Pass: Authorization: Bearer fk_..."
      }, { status: 401 });
    }

    const body = await req.json();
    const { url, flow, testers, budget_per_tester, tasks, time_limit_hours } = body;

    // Validate
    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "validation", message: "`url` is required and must be a valid URL" }, { status: 400 });
    }

    const count = Math.max(1, Math.min(100, parseInt(testers) || 3));
    const perTester = Math.max(5, parseFloat(budget_per_tester) || 10);
    const totalCents = Math.round(count * perTester * 100);
    const timeLimit = Math.max(1, Math.min(168, parseInt(time_limit_hours) || 24));
    const testMode = tasks?.length ? "tasks" : "freeuse";
    const taskList = Array.isArray(tasks) ? tasks.filter((t: string) => t?.trim()).map((t: string) => sanitize(t)) : [];
    const description = sanitize(flow || "General usability test");

    const sql = getSql();

    // Create order
    const rows = await sql`
      INSERT INTO orders (
        email, company, app_url, app_type, description, target_audience,
        plan, testers_count, price_cents, price_per_tester_cents,
        time_limit_hours, test_mode, tasks, status, api_created
      ) VALUES (
        ${user.email}, ${user.name || null}, ${sanitize(url)}, ${'web'},
        ${description}, ${sanitize(body.target_audience || '') || null},
        ${'custom'}, ${count}, ${totalCents}, ${Math.round(perTester * 100)},
        ${timeLimit}, ${testMode}, ${JSON.stringify(taskList)}, ${'pending_payment'},
        ${true}
      ) RETURNING id, created_at
    `;

    const order = rows[0];

    // Generate Stripe checkout
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "server", message: "Payment not configured" }, { status: 503 });
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: user.currency || "usd",
          product_data: {
            name: `Flinchify — ${count} tester${count > 1 ? "s" : ""}`,
            description: `API test: ${count} tester${count > 1 ? "s" : ""} at $${perTester}/each for ${url}`,
          },
          unit_amount: Math.round(perTester * 100),
        },
        quantity: count,
      }],
      mode: "payment",
      success_url: `${baseUrl}/submit/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/submit?cancelled=true`,
      customer_email: user.email,
      metadata: { order_id: String(order.id), source: "api" },
    });

    await sql`UPDATE orders SET stripe_session_id = ${session.id} WHERE id = ${order.id}`;

    return NextResponse.json({
      test_id: `ft_${order.id}`,
      status: "pending_payment",
      checkout_url: session.url,
      testers: count,
      budget_per_tester: perTester,
      total: count * perTester,
      currency: user.currency || "usd",
      time_limit_hours: timeLimit,
      created_at: order.created_at,
    }, { status: 201 });

  } catch (e: unknown) {
    console.error("API v1 tests POST:", e);
    return NextResponse.json({ error: "server", message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// GET /api/v1/tests — List your tests
export async function GET(req: NextRequest) {
  try {
    await ensureTables();
    const user = await authenticateApiKey(req);
    if (!user) {
      return NextResponse.json({ error: "unauthorized", message: "Invalid or missing API key" }, { status: 401 });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, app_url, description, testers_count, price_per_tester_cents,
             status, test_mode, tasks, time_limit_hours, created_at,
             (SELECT COUNT(*)::int FROM applications WHERE order_id = orders.id) as applications_count,
             (SELECT COUNT(*)::int FROM applications WHERE order_id = orders.id AND status = 'accepted') as accepted_count
      FROM orders WHERE email = ${user.email}
      ORDER BY created_at DESC LIMIT 50
    `;

    return NextResponse.json({
      tests: rows.map(r => ({
        test_id: `ft_${r.id}`,
        url: r.app_url,
        description: r.description,
        testers: r.testers_count,
        budget_per_tester: r.price_per_tester_cents / 100,
        status: r.status,
        applications: r.applications_count,
        accepted: r.accepted_count,
        created_at: r.created_at,
      }))
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: "server", message: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
