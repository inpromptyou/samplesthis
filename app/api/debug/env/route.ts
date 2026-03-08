import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    RESEND_API_KEY: process.env.RESEND_API_KEY ? `set (${process.env.RESEND_API_KEY.substring(0, 6)}...)` : "NOT SET",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `set (${process.env.STRIPE_SECRET_KEY.substring(0, 7)}...)` : "NOT SET",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "NOT SET",
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "NOT SET",
    VERCEL_URL: process.env.VERCEL_URL || "NOT SET",
  });
}
