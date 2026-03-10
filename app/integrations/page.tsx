import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Flinchify Integrations | ChatGPT, Claude, Cursor, Grok, CLI",
  description: "Install Flinchify as a plugin for ChatGPT, Claude Desktop, Cursor, Grok, or use the CLI. Let your AI agent request human testing automatically.",
};

const INTEGRATIONS = [
  {
    name: "ChatGPT",
    desc: "Custom GPT with Actions. Ask ChatGPT to test your app and it creates a real human test job.",
    setup: "Create a Custom GPT → Add Action → Import from URL → paste: https://flinchify.com/.well-known/openapi.json → Add your API key as Bearer auth.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#10A37F"/><path d="M15.5 8.5h-7l3.5 3.5-3.5 3.5h7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    badge: "GPT Store",
    color: "#10A37F",
  },
  {
    name: "Claude Desktop",
    desc: "MCP server integration. Claude can create tests, check results, and manage credits — all through natural conversation.",
    setup: 'Add to claude_desktop_config.json:\n{\n  "mcpServers": {\n    "flinchify": {\n      "command": "npx",\n      "args": ["@flinchify/mcp-server"],\n      "env": { "FLINCHIFY_API_KEY": "fk_..." }\n    }\n  }\n}',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#D4A06A"/><path d="M8 8h8M8 12h6M8 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    badge: "MCP",
    color: "#D4A06A",
  },
  {
    name: "Cursor",
    desc: "MCP integration for Cursor IDE. Your coding agent requests human testing mid-workflow and reads structured results to fix issues.",
    setup: 'Add to .cursor/mcp.json:\n{\n  "mcpServers": {\n    "flinchify": {\n      "command": "npx",\n      "args": ["@flinchify/mcp-server"],\n      "env": { "FLINCHIFY_API_KEY": "fk_..." }\n    }\n  }\n}',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#000"/><path d="M7 7l10 5-10 5V7z" fill="white"/></svg>
    ),
    badge: "MCP",
    color: "#000",
  },
  {
    name: "Grok",
    desc: "OpenAPI Actions integration. Grok can call the Flinchify API to create tests and retrieve results.",
    setup: "Use the OpenAPI spec at https://flinchify.com/.well-known/openapi.json with your API key as Bearer auth.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#1D9BF0"/><path d="M7 7l5 5m0 0l5 5m-5-5l5-5m-5 5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    badge: "OpenAPI",
    color: "#1D9BF0",
  },
  {
    name: "CLI / Terminal",
    desc: "Install globally with npm. Works with any AI coding agent that can run shell commands — Codex, Replit Agent, Bolt, or custom setups.",
    setup: "npm install -g flinchify\nflinchify init\nflinchify test https://myapp.com --testers 3 --budget 10",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#1E1E1E"/><path d="M7 8l4 4-4 4m6 0h4" stroke="#98C379" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    badge: "npm",
    color: "#98C379",
  },
  {
    name: "REST API",
    desc: "Direct HTTP integration for custom agents, CI/CD pipelines, or any platform. Full OpenAPI 3.1 spec available.",
    setup: 'curl -X POST https://flinchify.com/api/v1/tests \\\n  -H "Authorization: Bearer fk_..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{"url":"https://myapp.com","testers":3}\'',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#F97316"/><path d="M8 12h8M12 8v8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
    ),
    badge: "API",
    color: "#F97316",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <Nav />
      <main className="pt-24 sm:pt-28 pb-16 px-5 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <h1 className="h text-[1.5rem] sm:text-[2.2rem] font-bold tracking-[-0.03em] text-center mb-3 text-[var(--text)]">
            Integrations
          </h1>
          <p className="text-[14px] sm:text-[16px] text-[var(--text-muted)] text-center max-w-lg mx-auto mb-12">
            Install Flinchify wherever your AI agent lives. One API key, real human testing from any platform.
          </p>

          <div className="space-y-6">
            {INTEGRATIONS.map((int) => (
              <div key={int.name} className="bg-white rounded-2xl border border-black/[0.04] p-6 sm:p-8 hover:border-black/[0.08] transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0">{int.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="h text-[16px] sm:text-[18px] font-semibold text-[var(--text)]">{int.name}</h2>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: int.color + "15", color: int.color }}>{int.badge}</span>
                    </div>
                    <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.6]">{int.desc}</p>
                  </div>
                </div>
                <div className="bg-[#1E1E1E] rounded-xl p-4 overflow-x-auto">
                  <pre className="text-[12px] sm:text-[13px] text-white/80 font-mono leading-[1.7] whitespace-pre-wrap">{int.setup}</pre>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-y-4">
            <p className="text-[14px] text-[var(--text-muted)]">
              All integrations use the same API key. Get yours from the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard?tab=api" className="btn btn-accent text-[14px] !py-3 !px-6">
                Get API Key
              </Link>
              <a href="/.well-known/openapi.json" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-[14px] !py-3 !px-6">
                OpenAPI Spec
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
