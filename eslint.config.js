import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'functions/lib',
      'node_modules',
      '**/*.tsbuildinfo',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Unused vars are an error, but allow the _-prefix escape hatch.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Firestore payloads are genuinely dynamic in places; warn rather than block.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Use services/logger instead: it suppresses debug/info in production and
      // keeps a history buffer, neither of which a bare console call does.
      'no-console': 'error',
    },
  },
  {
    // Node-side Cloud Functions and build config.
    files: ['functions/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // The logger is the one place console belongs - it is what everything else
    // is meant to call instead.
    files: ['src/services/logger.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
);
