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
  const [user] = await sql`SELECT id FROM testers WHERE auth_token = ${token} LIMIT 1`;
  return user || null;
}

export async function GET() {
  try {
    await ensureTables();
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const sql = getSql();
    const notifications = await sql`
      SELECT id, type, title, message, link, read, created_at
      FROM notifications WHERE tester_id = ${user.id}
      ORDER BY created_at DESC LIMIT 50
    `;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unread = notifications.filter((n: any) => !n.read).length;
    return NextResponse.json({ notifications, unread });
  } catch (e) {
    console.error("notifications GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Mark as read
export async function PATCH(req: NextRequest) {
  try {
    await ensureTables();
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const body = await req.json();
    const sql = getSql();
    if (body.read_all) {
      await sql`UPDATE notifications SET read = true WHERE tester_id = ${user.id}`;
    } else if (body.id) {
      await sql`UPDATE notifications SET read = true WHERE id = ${body.id} AND tester_id = ${user.id}`;
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("notifications PATCH error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
