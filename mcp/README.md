# @flinchify/mcp-server

Human usability testing for AI agents via Model Context Protocol.

Real humans test your app. Your AI reads the results and fixes the bugs.

## Setup with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "flinchify": {
      "command": "npx",
      "args": ["@flinchify/mcp-server"],
      "env": {
        "FLINCHIFY_API_KEY": "fk_your_key_here"
      }
    }
  }
}
```

Get your API key at [flinchify.com/dashboard](https://flinchify.com/dashboard) → API Keys tab.

## Setup with Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "flinchify": {
      "command": "npx",
      "args": ["@flinchify/mcp-server"],
      "env": {
        "FLINCHIFY_API_KEY": "fk_your_key_here"
      }
    }
  }
}
```

## Available Tools

### `create_test`
Create a human usability test job.

**Example prompt:** "Have 5 real humans test my app at https://myapp.com — they should sign up, create a project, and try to invite a teammate. Budget $10 per tester."

### `get_test_results`
Get results from a test — severity-ranked issues, feedback, recordings.

**Example prompt:** "Check the results from test ft_127"

### `list_tests`
List all your test jobs.

### `check_credits`
Check your credit balance.

## How It Works

1. You buy credits at flinchify.com ($50-$500 packs)
2. Your AI agent creates test jobs using credits (no checkout needed)
3. Real humans test the app and report issues
4. Your AI reads the structured results and can fix bugs automatically

## License

MIT
