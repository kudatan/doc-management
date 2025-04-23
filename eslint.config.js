const tseslint = require('typescript-eslint');
const angularTs = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularHtmlParser = require('@angular-eslint/template-parser');
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
        tsconfigRootDir: __dirname,
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
      parser: angularHtmlParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      ...angularTemplate.configs.accessibility.rules,
    },
  },
];
