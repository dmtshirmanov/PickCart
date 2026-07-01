export default {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  endOfLine: 'auto',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^_screens',
    '^_widgets',
    '^_features',
    '^_entities',
    '^_shared/',
    '^\\.',
  ],
  importOrderParserPlugins: ['typescript', 'jsx'],
};
