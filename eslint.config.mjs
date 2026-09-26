import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { OVERSIZE_ALLOWLIST, LEGACY_ANY_ALLOWLIST, MAX_LINES } from './eslint.oversize.mjs';

const LINE_LIMITS = { skipBlankLines: true, skipComments: true };
// Route folders like app/(x)/[id] contain glob metacharacters.
const asGlob = (files) => files.map((f) => f.replace(/[[\]]/g, '\\$&'));

// ESLint's built-in max-lines only supports one severity. We want a soft warning
// at 200 lines (CLAUDE.md guidance) plus the existing hard error at 400, so the
// 200-line check is this tiny local rule instead of a second max-lines entry.
const WARN_LINES = 200;
const localRules = {
  rules: {
    'file-length-warn': {
      meta: { type: 'suggestion', schema: [] },
      create(context) {
        return {
          'Program:exit'(node) {
            const lineCount = context.sourceCode.lines.filter((line) => line.trim() !== '').length;
            if (lineCount > WARN_LINES) {
              context.report({
                node,
                message: `File has ${lineCount} lines; split it before it reaches the ${MAX_LINES}-line hard limit.`,
              });
            }
          },
        };
      },
    },
  },
};

export default [
  {
    ignores: [
      '.claude/**',
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/**',
      '**/*.js',
      'lib/logging/log-catalog.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    plugins: { 'unused-imports': unusedImports, local: localRules },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'error',
      'max-lines': ['error', { max: MAX_LINES, ...LINE_LIMITS }],
      'max-lines-per-function': ['warn', { max: 80, ...LINE_LIMITS }],
      'local/file-length-warn': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    files: [
      'e2e/**',
      'tests/**',
      'loadtests/**',
      'scripts/**',
      'components/ui/**',
      'lib/i18n/translations/**',
    ],
    rules: { 'max-lines': 'off', 'max-lines-per-function': 'off', 'local/file-length-warn': 'off' },
  },
  {
    files: ['e2e/**', 'tests/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    files: ['scripts/**', 'tools/**', 'lib/logging/**', 'app/api/log/**'],
    rules: { 'no-console': 'off' },
  },
  { files: asGlob(OVERSIZE_ALLOWLIST), rules: { 'max-lines': 'off' } },
  {
    files: asGlob(LEGACY_ANY_ALLOWLIST),
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': 'warn',
    },
  },
];
