import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

    const sql = getSql();
    const stripe = new Stripe(sk);

    // Get tester from auth cookie
    const token = req.cookies.get("tester_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const [tester] = await sql`SELECT * FROM testers WHERE auth_token = ${token}`;
    if (!tester) return NextResponse.json({ error: "Tester not found" }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://samplesthis.vercel.app";

    // Create or reuse Stripe Connect Express account
    let accountId = tester.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: tester.email,
        metadata: { tester_id: String(tester.id) },
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await sql`UPDATE testers SET stripe_account_id = ${accountId} WHERE id = ${tester.id}`;
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/dashboard?connect=retry`,
      return_url: `${baseUrl}/dashboard?connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (e: unknown) {
    console.error("Connect onboard error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
