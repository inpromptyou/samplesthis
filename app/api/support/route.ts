import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

export const dynamic = "force-dynamic";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tester_token")?.value;
  if (!token) return null;
  const sql = getSql();
  const [user] = await sql`SELECT id, name, email FROM testers WHERE auth_token = ${token} LIMIT 1`;
  return user || null;
}

// Get chat history
export async function GET() {
  try {
    await ensureTables();
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const sql = getSql();
    const messages = await sql`
      SELECT id, sender, message, created_at
      FROM support_messages WHERE tester_id = ${user.id}
      ORDER BY created_at ASC LIMIT 100
    `;
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("support GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Send a message
export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
    }
    const sql = getSql();
    const [msg] = await sql`
      INSERT INTO support_messages (tester_id, sender, message)
      VALUES (${user.id}, 'user', ${message.trim()})
      RETURNING id, sender, message, created_at
    `;
    return NextResponse.json({ message: msg });
  } catch (e) {
    console.error("support POST error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
