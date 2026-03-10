import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import crypto from "crypto";

function generateApiKey(): string {
  return "fk_" + crypto.randomBytes(32).toString("hex");
}

async function ensureApiKeys() {
  const sql = getSql();
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
}

// POST /api/v1/keys — Generate API key (requires cookie auth)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tester_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Log in first" }, { status: 401 });
    }

    const sql = getSql();
    const [user] = await sql`SELECT id, email FROM testers WHERE auth_token = ${token}`;
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await ensureApiKeys();

    const body = await req.json().catch(() => ({}));
    const name = body.name || "default";
    const key = generateApiKey();

    await sql`INSERT INTO api_keys (key, tester_id, name) VALUES (${key}, ${user.id}, ${name})`;

    return NextResponse.json({
      key,
      name,
      message: "Save this key — it won't be shown again.",
    }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// GET /api/v1/keys — List your API keys (masked)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tester_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Log in first" }, { status: 401 });
    }

    const sql = getSql();
    const [user] = await sql`SELECT id FROM testers WHERE auth_token = ${token}`;
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await ensureApiKeys();

    const rows = await sql`
      SELECT id, name, created_at, last_used_at, revoked,
             CONCAT('fk_', LEFT(SUBSTRING(key FROM 4), 8), '...') as key_preview
      FROM api_keys WHERE tester_id = ${user.id} ORDER BY created_at DESC
    `;

    return NextResponse.json({ keys: rows });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// DELETE /api/v1/keys — Revoke a key
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("tester_token")?.value;
    if (!token) return NextResponse.json({ error: "Log in first" }, { status: 401 });

    const sql = getSql();
    const [user] = await sql`SELECT id FROM testers WHERE auth_token = ${token}`;
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { key_id } = await req.json();
    await sql`UPDATE api_keys SET revoked = true WHERE id = ${key_id} AND tester_id = ${user.id}`;

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
