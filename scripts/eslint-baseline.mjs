import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASELINE_PATH = 'eslint-baseline.json';

/**
 * Stable id per violation (line-based; update baseline when fixing or moving code).
 */
function issueId(filePath, message) {
  const rel = path.relative(process.cwd(), filePath);
  return `${rel}:${message.line}:${message.column}:${message.ruleId ?? 'unknown'}`;
}

function runEslintJson() {
  let json;
  try {
    json = execFileSync('npx', ['eslint', '.', '-f', 'json'], {
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });
  } catch (error) {
    const execErr = error;
    if (execErr.status === 1 && execErr.stdout) {
      json = execErr.stdout;
    } else {
      throw error;
    }
  }
  return JSON.parse(json);
}

function collectErrors(results) {
  const issues = [];
  for (const file of results) {
    for (const message of file.messages) {
      if (message.severity !== 2) {
        continue;
      }
      issues.push({
        id: issueId(file.filePath, message),
        file: path.relative(process.cwd(), file.filePath),
        line: message.line,
        column: message.column,
        rule: message.ruleId,
        message: message.message,
      });
    }
  }
  issues.sort((a, b) => a.id.localeCompare(b.id));
  return issues;
}

const command = process.argv[2] ?? 'check';

if (command === 'update') {
  const issues = collectErrors(runEslintJson());
  const payload = {
    version: 1,
    errorCount: issues.length,
    issues,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${issues.length} issue(s) to ${BASELINE_PATH}`);
} else if (command === 'check') {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const current = collectErrors(runEslintJson());
  const baselineIds = new Set(baseline.issues.map((issue) => issue.id));
  const currentIds = new Set(current.map((issue) => issue.id));

  const newIssues = current.filter((issue) => !baselineIds.has(issue.id));
  const fixedIssues = baseline.issues.filter((issue) => !currentIds.has(issue.id));

  if (newIssues.length > 0) {
    console.error('Nieuwe ESLint-fouten (niet in baseline):');
    for (const issue of newIssues) {
      console.error(`  ${issue.file}:${issue.line}:${issue.column} ${issue.rule} — ${issue.message}`);
    }
    process.exit(1);
  }

  if (fixedIssues.length > 0) {
    console.log(
      `${fixedIssues.length} baseline-issue(s) opgelost; draai \`npm run lint:baseline:update\` om de baseline te verversen.`,
    );
  }

  console.log(`ESLint baseline OK (${current.length} bekende error(s), ${newIssues.length} nieuw).`);
} else {
  console.error(`Onbekend commando: ${command} (gebruik check of update)`);
  process.exit(1);
}