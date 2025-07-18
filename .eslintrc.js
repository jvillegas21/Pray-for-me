module.exports = {
  root: true,
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'node_modules/',
    'backend/dist/',
    'ios/',
    'android/',
    'coverage/',
    '*.d.ts',
  ],
  rules: {
    // Silence non-critical formatting issues
    'prettier/prettier': 'off',
    'quotes': 'off',
    'semi': 'off',
    'eol-last': 'off',
    'no-trailing-spaces': 'off',
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'space-before-function-paren': 'off',
    'indent': 'off',
    
    // Keep important code quality rules but make them warnings
    'no-console': 'off', // Allow console logs for debugging
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // Too noisy during development
    'no-undef': 'error',
    'no-unreachable': 'warn', // Make this a warning instead of error
    'no-dupe-keys': 'error', // Correct rule name
    'no-redeclare': 'error',
    'radix': 'off', // Allow parseInt without radix
    
    // React/React Native specific - make these less strict
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react-native/no-unused-styles': 'off', // Too noisy - styles might be used conditionally
    'react-native/split-platform-components': 'off', // Allow cross-platform imports
    'react-native/no-inline-styles': 'off', // Allow inline styles for flexibility
  },
  
  // Add test environment support
  env: {
    jest: true,
    node: true,
  },
};
