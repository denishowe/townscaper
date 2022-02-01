module.exports = {
  env: { browser: true, es2021: true },
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  rules: {
    'function-call-argument-newline': 'off',
    'function-paren-newline': 'off',
    'no-console': 'off',
    'no-extend-native': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-use-before-define': 'off',
  },
};
