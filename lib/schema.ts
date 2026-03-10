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

    await sql`CREATE TABLE IF NOT EXISTS businesses (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      company VARCHAR(255),
      verified BOOLEAN DEFAULT false,
      auth_token VARCHAR(64),
      verify_code VARCHAR(10),
      verify_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Migration helpers for existing tables
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_per_tester_cents INTEGER`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS auth_token VARCHAR(64)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS total_earned_cents INTEGER DEFAULT 0`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES testers(id)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS portfolio VARCHAR(500)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS twitter VARCHAR(100)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS github VARCHAR(100)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS other_links TEXT DEFAULT '[]'`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS verify_code VARCHAR(10)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS verify_expires TIMESTAMP`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS country VARCHAR(100)`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'usd'`;
    await sql`ALTER TABLE testers ADD COLUMN IF NOT EXISTS credit_cents INTEGER DEFAULT 0`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS payout_cents INTEGER DEFAULT 0`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS payout_transfer_id VARCHAR(255)`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS feedback TEXT`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS screen_recording_url VARCHAR(500)`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS screenshots TEXT DEFAULT '[]'`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS payout_error TEXT`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMP`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS task_responses JSONB DEFAULT '[]'`;

    // Bookings system
    await sql`CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      tester_id INTEGER REFERENCES testers(id),
      scheduled_date DATE NOT NULL,
      scheduled_time VARCHAR(10) NOT NULL,
      timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
      duration_minutes INTEGER DEFAULT 30,
      status VARCHAR(20) DEFAULT 'pending',
      app_ready BOOLEAN DEFAULT false,
      app_ready_deadline TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      confirmed_at TIMESTAMP,
      completed_at TIMESTAMP
    )`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS time_limit_hours INTEGER DEFAULT 24`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS test_mode VARCHAR(20) DEFAULT 'freeuse'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS booking_deadline TIMESTAMP`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS api_created BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS recording_url VARCHAR(500)`;

    // Notifications
    await sql`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      tester_id INTEGER REFERENCES testers(id),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      link VARCHAR(500),
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

    // Support messages
    await sql`CREATE TABLE IF NOT EXISTS support_messages (
      id SERIAL PRIMARY KEY,
      tester_id INTEGER REFERENCES testers(id),
      sender VARCHAR(20) DEFAULT 'user',
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`;

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
