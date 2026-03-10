import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Flinchify Guide | How to Use the API, CLI & MCP",
  description: "Step-by-step guide to using Flinchify with your AI agent: CLI, REST API, MCP for Claude & Cursor, and ChatGPT/Grok integrations.",
};

const STEPS = [
  {
    id: "get-started",
    title: "1. Create your account & get an API key",
    content: `Sign up at flinchify.com, then go to your Dashboard → API & Credits tab.\n\nClick "Generate" to create an API key. It starts with \`fk_\` — copy it and keep it safe.\n\nThis single key works across all integrations: CLI, API, MCP, ChatGPT, and Grok.`,
    code: null,
  },
  {
    id: "cli",
    title: "2. Using the CLI (terminal)",
    content: `The fastest way to create tests. Install globally with npm:`,
    code: `# Install
npm install -g flinchify

# Save your API key (one time)
flinchify init
# → Paste your fk_... key when prompted

# Create a test
flinchify test https://myapp.com \\
  --flow "Sign up, create a project, invite a teammate" \\
  --testers 3 \\
  --budget 10

# Check status
flinchify list

# Get results
flinchify results ft_42

# Check your credit balance
flinchify balance`,
  },
  {
    id: "api",
    title: "3. Using the REST API directly",
    content: `For custom integrations, CI/CD pipelines, or any HTTP client. All endpoints accept JSON and use Bearer token auth.`,
    code: `# Create a test
curl -X POST https://flinchify.com/api/v1/tests \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://myapp.com",
    "description": "Test the onboarding flow",
    "testers": 3,
    "budget_per_tester": 10
  }'

# Get test status
curl https://flinchify.com/api/v1/tests/ft_42 \\
  -H "Authorization: Bearer fk_your_key_here"

# List all tests
curl https://flinchify.com/api/v1/tests \\
  -H "Authorization: Bearer fk_your_key_here"

# Check credit balance
curl https://flinchify.com/api/v1/credits \\
  -H "Authorization: Bearer fk_your_key_here"`,
  },
  {
    id: "mcp-claude",
    title: "4. Claude Desktop (MCP)",
    content: `Claude Desktop supports MCP (Model Context Protocol) servers. Once set up, you can ask Claude to create tests, check results, and manage credits through natural conversation.\n\n"Hey Claude, can you create a test for my app at https://myapp.com? Get 3 testers to try the signup flow, $10 each."`,
    code: `# Step 1: Install the MCP server
npm install -g flinchify-mcp

# Step 2: Add to your Claude Desktop config
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\\Claude\\claude_desktop_config.json

{
  "mcpServers": {
    "flinchify": {
      "command": "npx",
      "args": ["flinchify-mcp"],
      "env": {
        "FLINCHIFY_API_KEY": "fk_your_key_here"
      }
    }
  }
}

# Step 3: Restart Claude Desktop
# You'll see "flinchify" in the tools list

# Available MCP tools:
# - create_test: Create a new human test
# - get_test: Check test status & results
# - list_tests: List all your tests
# - get_balance: Check credit balance`,
  },
  {
    id: "mcp-cursor",
    title: "5. Cursor IDE (MCP)",
    content: `Cursor supports MCP servers too. Your coding agent can request human testing mid-workflow, wait for results, and use the feedback to fix issues — all without leaving the IDE.`,
    code: `# Add to .cursor/mcp.json in your project root:

{
  "mcpServers": {
    "flinchify": {
      "command": "npx",
      "args": ["flinchify-mcp"],
      "env": {
        "FLINCHIFY_API_KEY": "fk_your_key_here"
      }
    }
  }
}

# Then in Cursor chat:
# "Test my app at localhost:3000 with 2 testers,
#  have them try the checkout flow"

# Cursor will use the MCP tool to create the test,
# then you can ask it to check results later.`,
  },
  {
    id: "chatgpt",
    title: "6. ChatGPT (Custom GPT)",
    content: `Create a Custom GPT that can create and manage tests through conversation.\n\nThis uses OpenAPI Actions — ChatGPT calls the Flinchify API on your behalf.`,
    code: `# Step 1: Go to chat.openai.com → Explore GPTs → Create
# Step 2: In "Configure" tab, scroll to "Actions"
# Step 3: Click "Create new action" → "Import from URL"
# Step 4: Paste this URL:

https://flinchify.com/.well-known/openapi.json

# Step 5: Add authentication:
#   Type: API Key
#   Auth Type: Bearer
#   Key: fk_your_key_here

# Step 6: Save and test!
# Ask your GPT: "Create a test for https://myapp.com
#   with 3 testers at $10 each"`,
  },
  {
    id: "grok",
    title: "7. Grok (OpenAPI)",
    content: `Grok supports OpenAPI integrations. Use the same spec as ChatGPT.`,
    code: `# Import the OpenAPI spec:
https://flinchify.com/.well-known/openapi.json

# Add your API key as Bearer auth:
Authorization: Bearer fk_your_key_here`,
  },
  {
    id: "credits",
    title: "8. Credits system",
    content: `Credits let AI agents create tests without checkout interruptions. Pre-purchase a credit pack, and your agent spends automatically.\n\nCredit packs:\n- Starter: $50 in credits for $60\n- Growth: $150 in credits for $180\n- Scale: $500 in credits for $600\n\nThe 20% markup covers the platform fee. Credits are non-refundable.\n\nIf you have no credits, the API falls back to Stripe Checkout — it returns a checkout URL instead.`,
    code: `# Buy credits via API
curl -X POST https://flinchify.com/api/v1/credits \\
  -H "Authorization: Bearer fk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"pack_id": "starter"}'

# Returns a Stripe checkout URL
# After payment, credits are added to your account

# Check balance
curl https://flinchify.com/api/v1/credits \\
  -H "Authorization: Bearer fk_your_key_here"`,
  },
];

export default function GuidePage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 96, paddingBottom: 64 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
          <h1 className="h" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 12, color: "var(--text)" }}>
            Getting Started Guide
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", textAlign: "center", maxWidth: 520, margin: "0 auto 16px", lineHeight: 1.6 }}>
            Everything you need to set up Flinchify with your AI agent, terminal, or app.
          </p>

          {/* Quick nav */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 48 }}>
            {[
              { label: "CLI", href: "#cli" },
              { label: "REST API", href: "#api" },
              { label: "Claude (MCP)", href: "#mcp-claude" },
              { label: "Cursor (MCP)", href: "#mcp-cursor" },
              { label: "ChatGPT", href: "#chatgpt" },
              { label: "Credits", href: "#credits" },
            ].map(l => (
              <a key={l.href} href={l.href} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none", transition: "border-color 0.15s" }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {STEPS.map(step => (
              <div key={step.id} id={step.id} style={{ scrollMarginTop: 100 }}>
                <h2 className="h" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>{step.title}</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, whiteSpace: "pre-line", marginBottom: step.code ? 16 : 0 }}>{step.content}</p>
                {step.code && (
                  <div style={{ background: "#1E1E1E", borderRadius: 12, padding: 20, overflowX: "auto" }}>
                    <pre style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                      <code>{step.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 48, padding: "32px 24px", background: "var(--bg-2)", borderRadius: 16 }}>
            <p className="h" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Ready to get started?</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Create your account and generate an API key.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard?tab=api" className="btn btn-accent" style={{ fontSize: 14, padding: "12px 24px" }}>
                Get API Key
              </Link>
              <Link href="/integrations" className="btn btn-outline" style={{ fontSize: 14, padding: "12px 24px" }}>
                View Integrations
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
