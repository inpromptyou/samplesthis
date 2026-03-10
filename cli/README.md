# flinchify

Test your app with real humans from the terminal.

## Install

```bash
npm install -g flinchify
```

## Setup

1. Sign up at [flinchify.com](https://flinchify.com)
2. Go to Dashboard → API Keys → Generate
3. Run:

```bash
flinchify init
```

## Usage

### Create a test

```bash
flinchify test https://myapp.com --flow "sign up and create a project" --testers 3 --budget 10
```

### Check results

```bash
flinchify results ft_42
```

### List all tests

```bash
flinchify list
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--flow` | What testers should do | General usability test |
| `--testers` | Number of testers | 3 |
| `--budget` | Per-tester budget ($) | 10 |
| `--tasks` | Specific tasks (comma-separated) | - |
| `--hours` | Time limit | 24 |
| `--audience` | Target audience | - |

## For AI Agents

Flinchify works with any AI coding agent. Your agent can:

1. Call `flinchify test <url>` to request human testing
2. Poll `flinchify results <id>` to get structured feedback
3. Use the feedback to fix issues automatically

```bash
# Agent workflow
flinchify test https://myapp.com --flow "complete checkout" --testers 5
# ... wait for results ...
flinchify results ft_123
```

## API

You can also call the API directly:

```bash
curl -X POST https://flinchify.com/api/v1/tests \
  -H "Authorization: Bearer fk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://myapp.com","flow":"sign up","testers":3,"budget_per_tester":10}'
```

## License

MIT
