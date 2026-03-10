#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { request } from "https";

const API_BASE = "https://flinchify.com/api/v1";
const CONFIG_DIR = join(homedir(), ".flinchify");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

// ── Helpers ──

function loadConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
}

function saveConfig(config) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function getKey() {
  const config = loadConfig();
  if (!config.api_key) {
    console.error("\x1b[31mNo API key configured.\x1b[0m Run: flinchify init");
    process.exit(1);
  }
  return config.api_key;
}

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const opts = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        "Authorization": `Bearer ${getKey()}`,
        "Content-Type": "application/json",
        "User-Agent": "flinchify-cli/0.1.0",
      },
    };

    const req = request(opts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function bold(s) { return `\x1b[1m${s}\x1b[0m`; }
function dim(s) { return `\x1b[2m${s}\x1b[0m`; }
function green(s) { return `\x1b[32m${s}\x1b[0m`; }
function yellow(s) { return `\x1b[33m${s}\x1b[0m`; }
function red(s) { return `\x1b[31m${s}\x1b[0m`; }
function cyan(s) { return `\x1b[36m${s}\x1b[0m`; }

// ── Commands ──

function showHelp() {
  console.log(`
${bold("flinchify")} — Test your app with real humans from the terminal

${bold("USAGE")}
  flinchify <command> [options]

${bold("COMMANDS")}
  ${cyan("init")}                     Save your API key
  ${cyan("test")} <url>                Create a test job
  ${cyan("results")} <test_id>         Get test results
  ${cyan("list")}                     List your tests
  ${cyan("balance")}                  Check credit balance
  ${cyan("help")}                     Show this help

${bold("EXAMPLES")}
  flinchify init
  flinchify test https://myapp.com --flow "sign up and create a project" --testers 3 --budget 10
  flinchify results ft_42
  flinchify list

${bold("OPTIONS")}
  --flow <description>     What testers should do
  --testers <number>       Number of testers (default: 3)
  --budget <amount>        Per-tester budget in $ (default: 10, min: 5)
  --tasks <task1,task2>    Specific tasks (comma-separated)
  --hours <number>         Time limit in hours (default: 24)
  --audience <description> Target audience description

${dim("Get your API key at https://flinchify.com/dashboard → API Keys")}
`);
}

async function cmdInit() {
  const args = process.argv.slice(3);
  let key = args[0];

  if (!key) {
    process.stdout.write(`\n${bold("Paste your API key")} ${dim("(from flinchify.com/dashboard)")}: `);
    const { createInterface } = await import("readline");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    key = await new Promise((resolve) => {
      rl.question("", (answer) => { rl.close(); resolve(answer.trim()); });
    });
  }

  if (!key || !key.startsWith("fk_")) {
    console.error(red("\nInvalid key. API keys start with fk_"));
    process.exit(1);
  }

  const config = loadConfig();
  config.api_key = key;
  saveConfig(config);
  console.log(green("\n✓ API key saved to ~/.flinchify/config.json"));
  console.log(dim("  Run: flinchify test https://yourapp.com\n"));
}

async function cmdTest() {
  const args = process.argv.slice(3);
  const url = args.find(a => !a.startsWith("--"));

  if (!url) {
    console.error(red("Usage: flinchify test <url> [options]"));
    process.exit(1);
  }

  // Parse flags
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && args[i + 1]) {
      flags[args[i].slice(2)] = args[++i];
    }
  }

  const body = {
    url,
    flow: flags.flow || "General usability test",
    testers: parseInt(flags.testers) || 3,
    budget_per_tester: parseFloat(flags.budget) || 10,
    time_limit_hours: parseInt(flags.hours) || 24,
    target_audience: flags.audience || null,
  };

  if (flags.tasks) {
    body.tasks = flags.tasks.split(",").map(t => t.trim());
  }

  console.log(`\n${bold("Creating test...")} ${dim(url)}`);
  console.log(dim(`  ${body.testers} testers × $${body.budget_per_tester}/each = $${body.testers * body.budget_per_tester}\n`));

  const res = await apiRequest("POST", "/tests", body);

  if (res.status === 201) {
    console.log(green("✓ Test created!"));
    console.log(`  ${bold("ID:")}       ${res.data.test_id}`);
    console.log(`  ${bold("Status:")}   ${res.data.status === "paid" ? green("paid (credits)") : yellow(res.data.status)}`);
    console.log(`  ${bold("Total:")}    $${res.data.total} ${res.data.currency.toUpperCase()}`);

    if (res.data.payment === "credits") {
      console.log(green(`\n  ✓ Paid with credits. $${res.data.credits_used} used, $${res.data.credits_remaining} remaining.`));
      console.log(dim("  Testers will be matched shortly. Check results with:"));
    } else {
      console.log(`\n  ${bold("Pay here:")} ${cyan(res.data.checkout_url)}`);
      if (res.data.credits_balance > 0) {
        console.log(dim(`  Credits balance: $${res.data.credits_balance} (need $${res.data.credits_needed} more)`));
      }
      console.log(dim("\n  After payment, testers will be matched. Check results with:"));
    }
    console.log(dim(`  flinchify results ${res.data.test_id}\n`));
  } else {
    console.error(red(`\n✗ Failed (${res.status}): ${res.data.message || res.data.error}\n`));
    process.exit(1);
  }
}

async function cmdResults() {
  const id = process.argv[3];
  if (!id) {
    console.error(red("Usage: flinchify results <test_id>"));
    process.exit(1);
  }

  console.log(`\n${bold("Fetching results...")} ${dim(id)}\n`);
  const res = await apiRequest("GET", `/tests/${id}`);

  if (res.status !== 200) {
    console.error(red(`✗ ${res.data.message || "Not found"}`));
    process.exit(1);
  }

  const t = res.data;
  const statusColor = t.status === "paid" ? green : t.status === "complete" ? green : yellow;

  console.log(`${bold("Test:")} ${t.test_id}`);
  console.log(`${bold("URL:")}  ${t.url}`);
  console.log(`${bold("Status:")} ${statusColor(t.status)}`);
  console.log(`${bold("Flow:")} ${t.description}`);
  console.log(`${bold("Testers:")} ${t.results.testers_completed}/${t.testers_requested} completed\n`);

  if (t.results.issues.length) {
    console.log(bold("Issues found:"));
    t.results.issues.forEach((issue, i) => {
      console.log(`  ${yellow(`[${issue.severity}]`)} ${issue.description}`);
      console.log(dim(`    — ${issue.tester}`));
    });
    console.log();
  }

  if (t.results.recordings.length) {
    console.log(bold("Recordings:"));
    t.results.recordings.forEach(r => console.log(`  ${cyan(r)}`));
    console.log();
  }

  if (!t.results.issues.length && !t.results.recordings.length) {
    console.log(dim("No results yet. Testers are still working on it.\n"));
  }
}

async function cmdList() {
  console.log(`\n${bold("Your tests:")}\n`);
  const res = await apiRequest("GET", "/tests");

  if (res.status !== 200) {
    console.error(red(`✗ ${res.data.message || "Failed"}`));
    process.exit(1);
  }

  if (!res.data.tests.length) {
    console.log(dim("No tests yet. Create one with: flinchify test <url>\n"));
    return;
  }

  res.data.tests.forEach(t => {
    const statusColor = t.status === "paid" ? green : t.status === "complete" ? green : yellow;
    console.log(`  ${bold(t.test_id)} ${statusColor(t.status)} ${dim(t.url)}`);
    console.log(dim(`    ${t.testers} testers × $${t.budget_per_tester} | ${t.accepted}/${t.testers} accepted | ${new Date(t.created_at).toLocaleDateString()}`));
    console.log();
  });
}

async function cmdBalance() {
  console.log(`\n${bold("Credit balance:")}\n`);
  const res = await apiRequest("GET", "/../v1/credits");

  if (res.status !== 200) {
    // Try alternate path
    const res2 = await apiRequest("GET", "/credits");
    if (res2.status === 200) {
      console.log(`  ${bold("Balance:")} ${green("$" + res2.data.balance)}`);
      console.log(dim(`\n  Buy credits at https://flinchify.com/dashboard?tab=api\n`));
      return;
    }
    console.error(red(`✗ ${res.data.message || "Failed to fetch balance"}`));
    process.exit(1);
  }

  console.log(`  ${bold("Balance:")} ${green("$" + res.data.balance)}`);
  if (res.data.packs?.length) {
    console.log(dim(`\n  Credit packs available:`));
    res.data.packs.forEach(p => {
      console.log(`    ${bold(p.label)} — ${p.credits} credits for ${p.price}`);
    });
  }
  console.log(dim(`\n  Buy credits at https://flinchify.com/dashboard?tab=api\n`));
}

// ── Router ──

const cmd = process.argv[2];

switch (cmd) {
  case "init": cmdInit(); break;
  case "test": cmdTest(); break;
  case "results": cmdResults(); break;
  case "list": cmdList(); break;
  case "balance": cmdBalance(); break;
  case "help": case "--help": case "-h": case undefined: showHelp(); break;
  default:
    console.error(red(`Unknown command: ${cmd}`));
    showHelp();
    process.exit(1);
}
