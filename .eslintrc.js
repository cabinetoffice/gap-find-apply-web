module.exports = {
  extends: ['next/core-web-vitals', 'next', 'prettier', 'eslint:recommended'],
  env: {
    jest: true,
    amd: true,
    es6: true,
  },
  globals: {
    cy: true,
    cypress: true,
    after: true,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'next/core-web-vitals',
        'next',
        'prettier',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
  plugins: ['eslint-plugin-prettier'],
  rules: {
    'no-shadow-restricted-names': 'off',
    'no-prototype-builtins': 'off',
    'prettier/prettier': 'error',
  },
  settings: {
    next: {
      rootDir: ['packages/applicant/', 'packages/admin/'],
    },
  },
};
