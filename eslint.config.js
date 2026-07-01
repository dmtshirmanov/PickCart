import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import pluginExportScope from 'eslint-plugin-export-scope';
import pluginImport from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactNative from 'eslint-plugin-react-native';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default tseslint.config(
  globalIgnores(['android/**', 'ios/**', 'node_modules/**', 'coverage/**']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat['jsx-runtime'],
      pluginImport.flatConfigs.recommended,
      pluginImport.flatConfigs.typescript,
      ...compat.extends('@feature-sliced/eslint-config/rules/layers-slices'),
    ],
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-native': pluginReactNative,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'import-x/no-internal-modules': ['error', { allow: ['**/src/**'] }],
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
    },
  },
  pluginExportScope.configs.flatConfigRecommended,
  {
    files: ['**/*.config.js', '**/*.config.cjs', '**/*.config.ts', '*.d.ts', 'index.js'],
    rules: {
      'export-scope/no-imports-outside-export-scope': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-named-as-default-member': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/__tests__/**'],
    rules: {
      'export-scope/no-imports-outside-export-scope': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
);
