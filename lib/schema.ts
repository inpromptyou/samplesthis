import { getSql } from "./db";

let migrated = false;

export async function ensureTables() {
  if (migrated) return;
  try {
    const sql = getSql();

    await sql`CREATE TABLE IF NOT EXISTS testers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      age_range VARCHAR(20),
      location VARCHAR(100),
      devices TEXT DEFAULT '[]',
      interests TEXT DEFAULT '[]',
      tech_comfort INTEGER DEFAULT 3,
      bio TEXT,
      status VARCHAR(20) DEFAULT 'active',
      verified BOOLEAN DEFAULT false,
      tests_completed INTEGER DEFAULT 0,
      total_earned_cents INTEGER DEFAULT 0,
      avg_rating NUMERIC(3,2) DEFAULT 0,
      auth_token VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      app_url TEXT NOT NULL,
      app_type VARCHAR(50),
      description TEXT,
      target_audience TEXT,
      plan VARCHAR(30) DEFAULT 'custom',
      testers_count INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      price_per_tester_cents INTEGER,
      status VARCHAR(20) DEFAULT 'pending_payment',
      stripe_session_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      tester_id INTEGER REFERENCES testers(id),
      status VARCHAR(20) DEFAULT 'pending',
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(order_id, tester_id)
    )`;

    // Migration helpers for existing tables
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_tester_cents INTEGER`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS auth_token VARCHAR(64)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS total_earned_cents INTEGER DEFAULT 0`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES testers(id)`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS payout_cents INTEGER DEFAULT 0`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS payout_transfer_id VARCHAR(255)`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`;

    migrated = true;
  } catch (e) {
    console.error("Auto-migrate failed:", e);
  }
}

export async function migrate() {
  migrated = false;
  await ensureTables();
  return { success: true, tables: ["testers", "orders", "applications"] };
}
