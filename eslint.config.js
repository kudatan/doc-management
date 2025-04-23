// eslint.config.js
const tseslint = require('typescript-eslint');
const angularTs = require('@angular-eslint/eslint-plugin');
const angularHtml = require('@angular-eslint/eslint-plugin-template');
const angularProcessor = require('@angular-eslint/template-parser');
const prettier = require('eslint-plugin-prettier');
const unusedImports = require('eslint-plugin-unused-imports');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angularTs,
      prettier,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.stylistic.rules,

      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],

      'prettier/prettier': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularProcessor.parser,
    },
    plugins: {
      '@angular-eslint/template': angularHtml,
    },
    rules: {
      ...angularHtml.configs.recommended.rules,
      ...angularHtml.configs.accessibility.rules,
    },
  },
];
