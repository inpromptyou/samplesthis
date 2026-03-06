import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  await ensureTables();
  const sql = getSql();

  const token = req.cookies.get("tester_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [tester] = await sql`SELECT * FROM testers WHERE auth_token = ${token}`;
  if (!tester) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get or create referral code
  let code = tester.referral_code;
  if (!code) {
    code = tester.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) + "-" + crypto.randomBytes(3).toString("hex");
    await sql`UPDATE testers SET referral_code = ${code} WHERE id = ${tester.id}`;
  }

  // Get referral stats
  const [stats] = await sql`
    SELECT 
      COUNT(*)::int as total_referrals,
      COUNT(*) FILTER (WHERE status = 'active')::int as active_referrals,
      COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) * 100, 0)::int as bonus_cents
    FROM testers WHERE referred_by = ${tester.id}
  `;

  const referrals = await sql`
    SELECT id, name, created_at, status FROM testers WHERE referred_by = ${tester.id} ORDER BY created_at DESC LIMIT 50
  `;

  return NextResponse.json({
    code,
    stats: {
      totalReferrals: stats.total_referrals,
      activeReferrals: stats.active_referrals,
      bonusEarned: stats.bonus_cents,
    },
    referrals,
  });
}
