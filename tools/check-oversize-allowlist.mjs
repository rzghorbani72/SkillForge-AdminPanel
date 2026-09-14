#!/usr/bin/env node
// Fails when a file in eslint.oversize.mjs is already under the max-lines limit,
// so the legacy allowlist can only shrink. Counts like ESLint: blank and comment lines skipped.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {
  OVERSIZE_ALLOWLIST,
  LEGACY_ANY_ALLOWLIST = [],
  MAX_LINES,
} = await import(resolve(ROOT, 'eslint.oversize.mjs'));

const codeLines = (src) =>
  src.split('\n').filter((l) => {
    const t = l.trim();
    return t !== '' && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  }).length;

const stale = OVERSIZE_ALLOWLIST.filter((f) => {
  const p = resolve(ROOT, f);
  return !existsSync(p) || codeLines(readFileSync(p, 'utf8')) <= MAX_LINES;
});

const LEGACY_PATTERN = /\bany\b|!\s*[.;)\]},]|console\.(log|warn|error|info|debug)\(/;
const cleanAny = LEGACY_ANY_ALLOWLIST.filter((f) => {
  const p = resolve(ROOT, f);
  return !existsSync(p) || !LEGACY_PATTERN.test(readFileSync(p, 'utf8'));
});

let failed = false;
if (stale.length) {
  failed = true;
  console.error(
    `These files are now within ${MAX_LINES} lines (or gone) — remove them from OVERSIZE_ALLOWLIST:`,
  );
  for (const f of stale) console.error(`  - ${f}`);
}
if (cleanAny.length) {
  failed = true;
  console.error(
    'These files no longer use `any`/`x!` (or are gone) — remove them from LEGACY_ANY_ALLOWLIST:',
  );
  for (const f of cleanAny) console.error(`  - ${f}`);
}
if (failed) process.exit(1);
console.log(
  `legacy allowlists: ${OVERSIZE_ALLOWLIST.length} oversize, ${LEGACY_ANY_ALLOWLIST.length} untyped file(s) left`,
);
