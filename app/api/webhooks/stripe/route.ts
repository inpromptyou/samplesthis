import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !sig) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const stripe = (await import("stripe")).default;
    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

    const event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const sql = getSql();

      // Credit purchase
      if (session.metadata?.type === "credit_purchase") {
        const testerId = parseInt(session.metadata.tester_id);
        const creditCents = parseInt(session.metadata.credit_cents);
        if (testerId && creditCents) {
          await sql`UPDATE testers SET credit_cents = COALESCE(credit_cents, 0) + ${creditCents} WHERE id = ${testerId}`;
          console.log(`Credits added: ${creditCents} cents to tester ${testerId}`);
        }
      }
      // Regular order payment
      else if (session.metadata?.order_id) {
        const orderId = parseInt(session.metadata.order_id);
        await sql`UPDATE orders SET status = 'paid' WHERE id = ${orderId}`;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Webhook error";
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
