import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tester_token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, reason: "no_cookie" }, { status: 401 });
    }

    const sql = getSql();
    const rows = await sql`SELECT * FROM testers WHERE auth_token = ${token} LIMIT 1`;
    const tester = rows[0];
    
    if (!tester) {
      return NextResponse.json({ authenticated: false, reason: "token_not_found" }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      id: tester.id,
      tester: {
        id: tester.id,
        name: tester.name,
        email: tester.email,
        age_range: tester.age_range,
        location: tester.location,
        devices: tester.devices,
        interests: tester.interests,
        tech_comfort: tester.tech_comfort,
        bio: tester.bio,
        tests_completed: tester.tests_completed,
        total_earned_cents: tester.total_earned_cents,
        avg_rating: tester.avg_rating,
        stripe_onboarded: tester.stripe_onboarded,
        created_at: tester.created_at,
      },
    });
  } catch (e: unknown) {
    console.error("testers/me error:", e);
    return NextResponse.json({ authenticated: false, reason: "error", detail: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}
