import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

// Business rates a tester's completed test
export async function POST(req: NextRequest) {
  await ensureTables();
  const sql = getSql();

  const token = req.cookies.get("tester_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user] = await sql`SELECT * FROM testers WHERE auth_token = ${token}`;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { application_id, rating, comment } = await req.json();
  if (!application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 });
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  // Verify this application belongs to an order the user posted
  const [app] = await sql`
    SELECT a.*, o.email as order_email, a.tester_id
    FROM applications a
    JOIN orders o ON a.order_id = o.id
    WHERE a.id = ${application_id} AND o.email = ${user.email}
  `;

  if (!app) return NextResponse.json({ error: "Application not found or not your order" }, { status: 404 });
  if (!["submitted", "completed"].includes(app.status)) {
    return NextResponse.json({ error: "Can only rate submitted/completed tests" }, { status: 400 });
  }
  if (app.rating) {
    return NextResponse.json({ error: "Already rated" }, { status: 400 });
  }

  // Save rating
  await sql`
    UPDATE applications SET 
      rating = ${rating},
      rating_comment = ${(comment || "").slice(0, 500) || null},
      rated_at = NOW()
    WHERE id = ${application_id}
  `;

  // Recalculate tester's avg_rating
  const [avg] = await sql`
    SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating, COUNT(*)::int as total_ratings
    FROM applications 
    WHERE tester_id = ${app.tester_id} AND rating IS NOT NULL
  `;

  await sql`
    UPDATE testers SET avg_rating = ${avg.avg_rating || 0} WHERE id = ${app.tester_id}
  `;

  return NextResponse.json({
    success: true,
    avg_rating: parseFloat(avg.avg_rating || "0"),
    total_ratings: avg.total_ratings,
  });
}
