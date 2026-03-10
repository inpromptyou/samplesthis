import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

export const dynamic = "force-dynamic";

function checkAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET || "flinchify-admin-2026";
  const cookieStore = req.cookies;
  return cookieStore.get("admin_token")?.value === secret;
}

// Get all support threads
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTables();
    const sql = getSql();
    // Get latest message per user + unread count
    const threads = await sql`
      SELECT 
        t.id as tester_id, t.name, t.email,
        (SELECT COUNT(*) FROM support_messages sm WHERE sm.tester_id = t.id AND sm.sender = 'user') as user_messages,
        (SELECT message FROM support_messages sm WHERE sm.tester_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM support_messages sm WHERE sm.tester_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM testers t
      WHERE EXISTS (SELECT 1 FROM support_messages sm WHERE sm.tester_id = t.id)
      ORDER BY last_message_at DESC
    `;
    return NextResponse.json({ threads });
  } catch (e) {
    console.error("admin support GET error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Reply to a user or get thread
export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTables();
    const { tester_id, message, action } = await req.json();
    const sql = getSql();

    if (action === "get_thread") {
      const messages = await sql`
        SELECT id, sender, message, created_at
        FROM support_messages WHERE tester_id = ${tester_id}
        ORDER BY created_at ASC
      `;
      return NextResponse.json({ messages });
    }

    if (!message || !tester_id) {
      return NextResponse.json({ error: "tester_id and message required" }, { status: 400 });
    }

    const [msg] = await sql`
      INSERT INTO support_messages (tester_id, sender, message)
      VALUES (${tester_id}, 'admin', ${message.trim()})
      RETURNING id, sender, message, created_at
    `;

    // Also create a notification for the user
    await sql`
      INSERT INTO notifications (tester_id, type, title, message, link)
      VALUES (${tester_id}, 'support', 'New support reply', ${message.trim().slice(0, 100)}, '/dashboard?tab=settings')
    `;

    return NextResponse.json({ message: msg });
  } catch (e) {
    console.error("admin support POST error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
