import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { OVERSIZE_ALLOWLIST, LEGACY_ANY_ALLOWLIST, MAX_LINES } from './eslint.oversize.mjs';

const LINE_LIMITS = { skipBlankLines: true, skipComments: true };
// Route folders like app/(x)/[id] contain glob metacharacters.
const asGlob = (files) => files.map((f) => f.replace(/[[\]]/g, '\\$&'));

export default [
  {
    ignores: ['.claude/**', '.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/**', '**/*.js', 'lib/logging/log-catalog.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'error',
      'max-lines': ['error', { max: MAX_LINES, ...LINE_LIMITS }],
      'max-lines-per-function': ['warn', { max: 80, ...LINE_LIMITS }],
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    files: ['e2e/**', 'tests/**', 'loadtests/**', 'scripts/**', 'components/ui/**', 'lib/i18n/translations/**'],
    rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' },
  },
  { files: ['scripts/**', 'tools/**', 'lib/logging/**', 'app/api/log/**'], rules: { 'no-console': 'off' } },
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
