#!/usr/bin/env node
/**
 * Stop-hook reminder (never blocks): if a change touches a path the
 * ARCHITECTURE.md owner map cares about, but neither doc was updated in the
 * same change, print a one-line nudge to stdout.
 */
import { execSync } from 'node:child_process';

const OWNER_MAP = [
  { glob: /^proxy\.ts$/, doc: 'docs/ARCHITECTURE.md (request-flow diagram)' },
  { glob: /^app\/\(protected\)\/[^/]+\/page\.tsx$/, doc: 'docs/ARCHITECTURE.md (component layering) / docs/ONBOARDING.md (folder map)' },
  { glob: /^lib\/api(\.ts|\/)/, doc: 'docs/ARCHITECTURE.md (data layer diagram)' },
  { glob: /^lib\/(auth-routing|browser-request-headers)\.ts$/, doc: 'docs/ARCHITECTURE.md (request-flow diagram)' },
];

function changedFiles() {
  try {
    const out = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
    const staged = execSync('git diff --name-only --cached', { encoding: 'utf8' });
    return [...new Set([...out.split('\n'), ...staged.split('\n')].filter(Boolean))];
  } catch {
    return [];
  }
}

const files = changedFiles();
if (files.length === 0) process.exit(0);

const docsChanged = files.some((f) => f === 'docs/ARCHITECTURE.md' || f === 'docs/ONBOARDING.md');
if (docsChanged) process.exit(0);

const hits = new Set();
for (const f of files) {
  for (const rule of OWNER_MAP) {
    if (rule.glob.test(f)) hits.add(rule.doc);
  }
}

if (hits.size > 0) {
  console.log(
    `[docs-reminder] Architecture-relevant files changed (${[...hits].join(', ')}) — ` +
      `consider updating docs/ARCHITECTURE.md / docs/ONBOARDING.md in this change.`,
  );
}
process.exit(0);
