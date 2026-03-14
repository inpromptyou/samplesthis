import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS tester_interest (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'tester',
      source TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE tester_interest ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'tester'`;
  await sql`ALTER TABLE tester_interest ADD COLUMN IF NOT EXISTS source TEXT`;
}

export async function POST(request: Request) {
  try {
    const { email, name, role, source } = await request.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const validRole = ["tester", "developer", "both"].includes(role) ? role : "tester";
    const sql = getSql();
    await ensureTable();

    await sql`
      INSERT INTO tester_interest (email, name, role, source) 
      VALUES (${email.toLowerCase().trim()}, ${name?.trim() || null}, ${validRole}, ${source?.trim() || null})
      ON CONFLICT (email) DO UPDATE SET 
        name = COALESCE(${name?.trim() || null}, tester_interest.name),
        role = ${validRole}
    `;

    const countRes = await sql`SELECT COUNT(*) FROM tester_interest`;
    const total = parseInt(countRes[0].count);

    return NextResponse.json({ success: true, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = getSql();
    await ensureTable();
    const res = await sql`SELECT COUNT(*) FROM tester_interest`;
    return NextResponse.json({ total: parseInt(res[0].count) });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
