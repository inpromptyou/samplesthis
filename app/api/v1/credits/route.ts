import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";

// Credit packs — price includes 20% platform fee
// e.g. $50 pack = $50 in testing credits, customer paid $60
const CREDIT_PACKS = [
  { id: "starter", label: "Starter", credits_cents: 5000, price_cents: 6000, description: "$50 in testing credits" },
  { id: "growth", label: "Growth", credits_cents: 15000, price_cents: 18000, description: "$150 in testing credits" },
  { id: "scale", label: "Scale", credits_cents: 50000, price_cents: 60000, description: "$500 in testing credits" },
];

// GET /api/v1/credits — Get balance + available packs
export async function GET(req: NextRequest) {
  try {
    await ensureTables();
    const token = req.cookies.get("tester_token")?.value;
    const authHeader = req.headers.get("authorization");

    let email: string | null = null;
    let creditCents = 0;

    const sql = getSql();

    if (authHeader?.startsWith("Bearer ")) {
      const key = authHeader.slice(7).trim();
      const rows = await sql`
        SELECT t.email, t.credit_cents FROM api_keys ak JOIN testers t ON t.id = ak.tester_id
        WHERE ak.key = ${key} AND ak.revoked = false
      `;
      if (rows.length) { email = rows[0].email; creditCents = rows[0].credit_cents || 0; }
    } else if (token) {
      const rows = await sql`SELECT email, credit_cents FROM testers WHERE auth_token = ${token}`;
      if (rows.length) { email = rows[0].email; creditCents = rows[0].credit_cents || 0; }
    }

    if (!email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      balance_cents: creditCents,
      balance: (creditCents / 100).toFixed(2),
      currency: "usd",
      packs: CREDIT_PACKS.map(p => ({
        id: p.id,
        label: p.label,
        credits: `$${(p.credits_cents / 100).toFixed(0)}`,
        price: `$${(p.price_cents / 100).toFixed(0)}`,
        description: p.description,
      })),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}

// POST /api/v1/credits — Purchase credits (returns Stripe checkout)
export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const token = req.cookies.get("tester_token")?.value;
    if (!token) return NextResponse.json({ error: "Log in first" }, { status: 401 });

    const sql = getSql();
    const [user] = await sql`SELECT id, email, currency FROM testers WHERE auth_token = ${token}`;
    if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const { pack_id } = await req.json();
    const pack = CREDIT_PACKS.find(p => p.id === pack_id);
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: user.currency || "usd",
          product_data: {
            name: `Flinchify API Credits — ${pack.label}`,
            description: `${pack.description} (non-refundable). Use with CLI or API to create tests automatically.`,
          },
          unit_amount: pack.price_cents,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?tab=api&credits=success`,
      cancel_url: `${baseUrl}/dashboard?tab=api&credits=cancelled`,
      customer_email: user.email,
      metadata: {
        type: "credit_purchase",
        tester_id: String(user.id),
        pack_id: pack.id,
        credit_cents: String(pack.credits_cents),
      },
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
