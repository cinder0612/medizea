module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable all TypeScript rules
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    
    // Disable all React rules
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'off',
    
    // Disable all Next.js rules
    '@next/next/no-img-element': 'off'
  },
  ignorePatterns: ['**/*'],
} 