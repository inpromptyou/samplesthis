import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { sanitize, isValidUrl } from "@/lib/sanitize";

// ─── MCP over HTTP (Streamable HTTP transport) ───
// Claude Desktop, Cursor, etc. can connect via: https://flinchify.com/mcp
// Auth: Bearer token in Authorization header (API key)

// Auth helper
async function authenticateApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key) return null;

  const sql = getSql();
  // Ensure api_keys table
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      tester_id INT NOT NULL,
      name TEXT DEFAULT 'default',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      revoked BOOLEAN DEFAULT false
    )
  `;

  const rows = await sql`
    SELECT ak.id as key_id, ak.tester_id, t.email, t.name, t.currency, t.credit_cents
    FROM api_keys ak JOIN testers t ON t.id = ak.tester_id
    WHERE ak.key = ${key} AND ak.revoked = false
  `;
  if (!rows.length) return null;

  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${rows[0].key_id}`;
  return rows[0];
}

// Tool definitions
const TOOLS = [
  {
    name: "create_test",
    description: "Create a human usability test job. Real humans will test the given URL and report issues, screen recordings, and friction notes.",
    inputSchema: {
      type: "object" as const,
      required: ["url"],
      properties: {
        url: { type: "string", description: "URL of the app or website to test" },
        flow: { type: "string", description: "What testers should do" },
        testers: { type: "number", description: "Number of human testers (default: 3)" },
        budget_per_tester: { type: "number", description: "Budget per tester in dollars (default: 10, min: 5)" },
        tasks: { type: "array", items: { type: "string" }, description: "Specific tasks for testers" },
        target_audience: { type: "string", description: "Ideal tester profile" },
        time_limit_hours: { type: "number", description: "Hours for testers to complete (default: 24)" },
      },
    },
  },
  {
    name: "get_test_results",
    description: "Get results from a human usability test. Returns severity-ranked issues, feedback, and recordings.",
    inputSchema: {
      type: "object" as const,
      required: ["test_id"],
      properties: {
        test_id: { type: "string", description: "Test ID (e.g. ft_127)" },
      },
    },
  },
  {
    name: "list_tests",
    description: "List all your test jobs with status and results summary.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "check_credits",
    description: "Check your Flinchify credit balance.",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

// Tool handlers
async function handleToolCall(name: string, args: Record<string, unknown>, user: Record<string, unknown>) {
  const sql = getSql();
  await ensureTables();

  switch (name) {
    case "create_test": {
      const url = args.url as string;
      if (!url || !isValidUrl(url)) return "Error: valid URL required";

      const count = Math.max(1, Math.min(100, parseInt(String(args.testers)) || 3));
      const perTester = Math.max(5, parseFloat(String(args.budget_per_tester)) || 10);
      const totalCents = Math.round(count * perTester * 100);
      const timeLimit = Math.max(1, Math.min(168, parseInt(String(args.time_limit_hours)) || 24));
      const tasks = Array.isArray(args.tasks) ? args.tasks.filter((t: unknown) => typeof t === "string" && (t as string).trim()).map((t: unknown) => sanitize(t as string)) : [];
      const description = sanitize((args.flow as string) || "General usability test");
      const creditBalance = (user.credit_cents as number) || 0;

      if (creditBalance >= totalCents) {
        const rows = await sql`
          INSERT INTO orders (email, company, app_url, app_type, description, target_audience, plan, testers_count, price_cents, price_per_tester_cents, time_limit_hours, test_mode, tasks, status, api_created)
          VALUES (${user.email as string}, ${(user.name as string) || null}, ${sanitize(url)}, ${"web"}, ${description}, ${sanitize((args.target_audience as string) || "") || null}, ${"custom"}, ${count}, ${totalCents}, ${Math.round(perTester * 100)}, ${timeLimit}, ${tasks.length ? "tasks" : "freeuse"}, ${JSON.stringify(tasks)}, ${"paid"}, ${true})
          RETURNING id, created_at
        `;
        await sql`UPDATE testers SET credit_cents = credit_cents - ${totalCents} WHERE email = ${user.email as string} AND credit_cents >= ${totalCents}`;
        return `Test created!\n\nID: ft_${rows[0].id}\nStatus: paid\nTesters: ${count}\nTotal: $${count * perTester}\n\nPaid with credits. $${totalCents / 100} used, $${(creditBalance - totalCents) / 100} remaining.\nTesters will be matched shortly.`;
      }

      // Stripe checkout fallback
      const rows = await sql`
        INSERT INTO orders (email, company, app_url, app_type, description, target_audience, plan, testers_count, price_cents, price_per_tester_cents, time_limit_hours, test_mode, tasks, status, api_created)
        VALUES (${user.email as string}, ${(user.name as string) || null}, ${sanitize(url)}, ${"web"}, ${description}, ${sanitize((args.target_audience as string) || "") || null}, ${"custom"}, ${count}, ${totalCents}, ${Math.round(perTester * 100)}, ${timeLimit}, ${tasks.length ? "tasks" : "freeuse"}, ${JSON.stringify(tasks)}, ${"pending_payment"}, ${true})
        RETURNING id, created_at
      `;

      if (!process.env.STRIPE_SECRET_KEY) return "Error: Payment not configured on server";

      const stripe = (await import("stripe")).default;
      const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://flinchify.com");

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price_data: { currency: (user.currency as string) || "usd", product_data: { name: `Flinchify — ${count} tester${count > 1 ? "s" : ""}` }, unit_amount: Math.round(perTester * 100) }, quantity: count }],
        mode: "payment",
        success_url: `${baseUrl}/submit/success?order=${rows[0].id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/submit?cancelled=true`,
        customer_email: user.email as string,
        metadata: { order_id: String(rows[0].id), source: "mcp" },
      });

      await sql`UPDATE orders SET stripe_session_id = ${session.id} WHERE id = ${rows[0].id}`;
      return `Test created!\n\nID: ft_${rows[0].id}\nStatus: pending_payment\nTesters: ${count}\nTotal: $${count * perTester}\n\nPayment required: ${session.url}\n\nComplete payment at the URL above to start matching testers.`;
    }

    case "get_test_results": {
      const testId = String(args.test_id || "").replace(/^ft_/, "");
      const rows = await sql`SELECT id, app_url, description, testers_count, status, created_at FROM orders WHERE id = ${parseInt(testId)} AND email = ${user.email as string}`;
      if (!rows.length) return "Test not found.";
      const order = rows[0];
      const apps = await sql`SELECT a.status, a.feedback, a.recording_url, t.name as tester_name FROM applications a LEFT JOIN testers t ON t.id = a.tester_id WHERE a.order_id = ${order.id}`;

      let text = `Test: ft_${order.id}\nURL: ${order.app_url}\nStatus: ${order.status}\nFlow: ${order.description}\nTesters: ${apps.filter((a: Record<string, unknown>) => a.status === "completed").length}/${order.testers_count} completed`;
      if (apps.some((a: Record<string, unknown>) => a.feedback)) {
        text += "\n\nFeedback:";
        apps.filter((a: Record<string, unknown>) => a.feedback).forEach((a: Record<string, unknown>) => { text += `\n  ${a.tester_name || "Anon"}: ${a.feedback}`; });
      }
      if (apps.some((a: Record<string, unknown>) => a.recording_url)) {
        text += "\n\nRecordings:";
        apps.filter((a: Record<string, unknown>) => a.recording_url).forEach((a: Record<string, unknown>) => { text += `\n  ${a.recording_url}`; });
      }
      if (!apps.some((a: Record<string, unknown>) => a.feedback) && !apps.some((a: Record<string, unknown>) => a.recording_url)) {
        text += "\n\nNo results yet — testers are still working.";
      }
      return text;
    }

    case "list_tests": {
      const rows = await sql`
        SELECT id, app_url, testers_count, status, created_at,
          (SELECT COUNT(*)::int FROM applications WHERE order_id = orders.id AND status = 'accepted') as accepted
        FROM orders WHERE email = ${user.email as string} ORDER BY created_at DESC LIMIT 50
      `;
      if (!rows.length) return "No tests yet. Use create_test to submit your first test job.";
      let text = "Your tests:\n";
      rows.forEach((t: Record<string, unknown>) => { text += `\nft_${t.id} [${t.status}] ${t.app_url} — ${t.accepted}/${t.testers_count} testers accepted\n`; });
      return text;
    }

    case "check_credits": {
      const [account] = await sql`SELECT credit_cents FROM testers WHERE email = ${user.email as string}`;
      const balance = ((account?.credit_cents as number) || 0) / 100;
      return `Credit balance: $${balance.toFixed(2)}\n\nBuy credits at https://flinchify.com/dashboard?tab=api\n\nPacks: Starter $50 ($60), Growth $150 ($180), Scale $500 ($600)`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// JSON-RPC response helper
function jsonrpc(id: string | number | null, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonrpcError(id: string | number | null, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// Handle MCP requests
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const { id, method, params } = body;

  // Initialize — no auth needed
  if (method === "initialize") {
    return NextResponse.json(jsonrpc(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "flinchify", version: "0.2.0" },
    }), {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  // Notifications — ack silently
  if (method === "notifications/initialized" || method?.startsWith("notifications/")) {
    return new NextResponse(null, { status: 204 });
  }

  // tools/list — public, no auth needed (so Claude can discover tools)
  if (method === "tools/list") {
    return NextResponse.json(jsonrpc(id, { tools: TOOLS }), {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  // Everything else requires auth
  const user = await authenticateApiKey(authHeader);
  if (!user) {
    return NextResponse.json(jsonrpcError(id, -32600, "Invalid API key. Get one at https://flinchify.com/dashboard → API Keys"), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  if (method === "tools/call") {
    try {
      const text = await handleToolCall(params.name, params.arguments || {}, user);
      return NextResponse.json(jsonrpc(id, { content: [{ type: "text", text }] }), {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    } catch (e: unknown) {
      return NextResponse.json(jsonrpc(id, { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Unknown error"}` }] }), {
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  return NextResponse.json(jsonrpcError(id, -32601, `Method not found: ${method}`), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// GET — discovery/info
export async function GET() {
  return NextResponse.json({
    name: "flinchify",
    version: "0.2.0",
    description: "Human usability testing for AI agents. Real humans test your app, your AI reads the results.",
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
    auth: "Bearer API key required. Get yours at https://flinchify.com/dashboard",
    docs: "https://flinchify.com/integrations",
  }, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
