# flinchify-mcp

Human usability testing for AI agents via Model Context Protocol.

Real humans test your app. Your AI reads the results and fixes the bugs.

Works with **Claude Desktop**, **Cursor**, **OpenAI (ChatGPT)**, **Gemini**, **Grok**, and any MCP-compatible client.

## Quick Start

```bash
npx flinchify-mcp
```

Get your API key at [flinchify.com/dashboard](https://flinchify.com/dashboard) → API Keys tab.

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
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
```

### Cursor

Add to `.cursor/mcp.json`:

```json
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
```

### OpenAI (ChatGPT)

Add to your MCP tool configuration:

```json
{
  "command": "npx",
  "args": ["flinchify-mcp"],
  "env": {
    "FLINCHIFY_API_KEY": "fk_your_key_here"
  }
}
```

### Gemini

```json
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
```

### Grok

```json
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
```

### Windsurf / Any MCP Client

Any client that supports the Model Context Protocol can use Flinchify. Point it at `npx flinchify-mcp` with your API key as an environment variable.

## Available Tools

### `create_test`

Create a human usability test job. Real humans will test the given URL, follow your specified flow, and report back with issues, screen recordings, and friction notes.

**Example prompt:** *"Have 5 real humans test my app at https://myapp.com — they should sign up, create a project, and try to invite a teammate. Budget $10 per tester."*

**Parameters:**
- `url` (required) — URL to test
- `flow` — What testers should do
- `testers` — Number of testers (default: 3, max: 100)
- `budget_per_tester` — Per-tester budget in USD (default: $10, min: $5)
- `tasks` — Array of specific tasks (alternative to flow)
- `target_audience` — Ideal tester profile
- `time_limit_hours` — Hours to complete (default: 24)

### `get_test_results`

Get severity-ranked issues, tester feedback, screen recording URLs, and completion status.

**Example prompt:** *"Check the results from test ft_127"*

### `list_tests`

List all your test jobs with status and results summary.

### `check_credits`

Check your credit balance. Credits let you create tests instantly without checkout interruptions.

## How It Works

1. Sign up at [flinchify.com](https://flinchify.com) and get an API key
2. Buy credits ($50–$500 packs) or pay per test via Stripe checkout
3. Your AI agent creates test jobs — real humans are matched and test your app
4. Results come back structured: severity-ranked issues, feedback, recordings
5. Your AI reads the results and can fix bugs automatically

## Pricing

- **Minimum $5/tester** — you set the price
- **Credit packs**: Starter ($50), Growth ($150), Scale ($500)
- Credits = instant test creation, no checkout interruption
- No credits? Falls back to Stripe checkout link

## Links

- [Flinchify](https://flinchify.com)
- [Dashboard](https://flinchify.com/dashboard)
- [Integrations](https://flinchify.com/integrations)
- [API Docs](https://flinchify.com/integrations)

## License

MIT
