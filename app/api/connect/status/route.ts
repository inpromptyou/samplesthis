import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) return NextResponse.json({ onboarded: false, hasAccount: false });

  const sql = getSql();
  const stripe = new Stripe(sk);

  const token = req.cookies.get("tester_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [tester] = await sql`SELECT * FROM testers WHERE auth_token = ${token}`;
  if (!tester) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!tester.stripe_account_id) {
    return NextResponse.json({ onboarded: false, hasAccount: false });
  }

  // Check if onboarding is complete
  const account = await stripe.accounts.retrieve(tester.stripe_account_id);
  const onboarded = account.charges_enabled && account.payouts_enabled;

  if (onboarded && !tester.stripe_onboarded) {
    await sql`UPDATE testers SET stripe_onboarded = true WHERE id = ${tester.id}`;
  }

  return NextResponse.json({
    onboarded,
    hasAccount: true,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });
}
