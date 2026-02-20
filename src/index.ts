#!/usr/bin/env node

import { spawnSync } from "node:child_process";

type CommitType =
  | "feat"
  | "fix"
  | "chore"
  | "docs"
  | "style"
  | "refactor"
  | "perf"
  | "test"
  | "build"
  | "ci"
  | "revert";

type Lang = "zh" | "en";

interface CliOptions {
  type?: CommitType;
  lang: Lang;
  help: boolean;
}

const VALID_TYPES: CommitType[] = [
  "feat",
  "fix",
  "chore",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "revert"
];

function printHelp(): void {
  console.log(`ai-commit-smart\n\nUsage:\n  ai-commit [--type <type>] [--lang <zh|en>]\n\nOptions:\n  --type   Commit type, one of: ${VALID_TYPES.join(", ")}\n  --lang   Output language: zh or en (default: en)\n  -h, --help  Show help\n\nExamples:\n  ai-commit\n  ai-commit --type feat\n  ai-commit --type fix --lang zh`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { lang: "en", help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "--type") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --type");
      }
      if (!VALID_TYPES.includes(value as CommitType)) {
        throw new Error(`Invalid --type: ${value}. Allowed: ${VALID_TYPES.join(", ")}`);
      }
      options.type = value as CommitType;
      i += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("Missing value for --lang");
      }
      if (value !== "zh" && value !== "en") {
        throw new Error("Invalid --lang. Allowed: zh, en");
      }
      options.lang = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function getStagedDiff(): string {
  const result = spawnSync("git", ["diff", "--cached"], {
    encoding: "utf8"
  });

  if (result.error) {
    throw new Error(`Failed to run git diff --cached: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "git diff --cached failed");
  }

  const diff = result.stdout?.trim() || "";
  if (!diff) {
    throw new Error("No staged changes found. Please stage files first.");
  }

  return diff;
}

function buildPrompt(diff: string, options: CliOptions): string {
  const languageInstruction =
    options.lang === "zh"
      ? "Use Chinese for subject and body."
      : "Use English for subject and body.";

  const typeInstruction = options.type
    ? `Commit type is fixed to '${options.type}'.`
    : "Infer the best conventional commit type from the diff.";

  return [
    "You are a senior engineer writing git commit messages.",
    "Generate exactly one conventional commit message.",
    typeInstruction,
    languageInstruction,
    "Rules:",
    "1) Output only the final commit message text.",
    "2) First line format: type(scope optional): subject",
    "3) Keep subject <= 72 chars when possible.",
    "4) Add a blank line + concise body only if useful.",
    "5) No markdown fences, no explanations.",
    "",
    "Staged diff:",
    diff
  ].join("\n");
}

function generateMessageWithClaude(prompt: string): string {
  const result = spawnSync("claude", ["-p", prompt], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.error) {
    throw new Error(`Failed to run claude CLI: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "claude CLI failed");
  }

  const message = result.stdout?.trim() || "";
  if (!message) {
    throw new Error("Claude returned empty commit message.");
  }

  return message;
}

function main(): void {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
      return;
    }

    const diff = getStagedDiff();
    const prompt = buildPrompt(diff, options);
    const commitMessage = generateMessageWithClaude(prompt);

    console.log(commitMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`ai-commit error: ${message}`);
    process.exit(1);
  }
}

main();
