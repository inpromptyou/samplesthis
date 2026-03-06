import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ensureTables } from "@/lib/schema";
import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const body = await req.json();
    const { name, email, age_range, location, devices, interests, tech_comfort, bio, ref, linkedin, portfolio, twitter, github, other_links } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const sql = getSql();
    const existing = await sql`SELECT id, auth_token FROM testers WHERE email = ${email.toLowerCase()}`;
    
    if (existing.length > 0) {
      // Return existing token so they can log back in
      const token = existing[0].auth_token || generateToken();
      if (!existing[0].auth_token) {
        await sql`UPDATE testers SET auth_token = ${token} WHERE id = ${existing[0].id}`;
      }
      const res = NextResponse.json({ error: "You're already registered! Logging you in.", existing: true, id: existing[0].id }, { status: 200 });
      res.cookies.set("tester_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
      return res;
    }

    // Resolve referral
    let referredBy: number | null = null;
    if (ref) {
      const [referrer] = await sql`SELECT id FROM testers WHERE referral_code = ${ref}`;
      if (referrer) referredBy = referrer.id;
    }

    const token = generateToken();
    const rows = await sql`
      INSERT INTO testers (name, email, age_range, location, devices, interests, tech_comfort, bio, auth_token, referred_by, linkedin, portfolio, twitter, github, other_links)
      VALUES (
        ${name}, ${email.toLowerCase()}, ${age_range || null}, ${location || null},
        ${JSON.stringify(devices || [])}, ${JSON.stringify(interests || [])},
        ${tech_comfort || 3}, ${bio || null}, ${token}, ${referredBy},
        ${linkedin || null}, ${portfolio || null}, ${twitter || null}, ${github || null},
        ${JSON.stringify(other_links || [])}
      )
      RETURNING id
    `;

    const res = NextResponse.json({ success: true, id: rows[0].id });
    res.cookies.set("tester_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
