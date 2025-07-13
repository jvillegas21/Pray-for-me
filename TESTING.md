# Testing Guide for Pray For Me App

## 🧪 Overview

This document outlines the comprehensive testing strategy for the Pray For Me React Native application. We use Jest and React Native Testing Library for unit and integration testing.

## 📁 Test Structure

```
__tests__/
├── components/           # Component tests
├── screens/
│   └── auth/            # Authentication screen tests
├── services/            # Service layer tests
├── store/
│   └── slices/          # Redux slice tests
└── utils/
    └── test-utils.tsx   # Test utilities and helpers
```

## 🚀 Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- authService.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login"
```

### Test Coverage

We aim for **70% code coverage** across the application:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 📋 Test Categories

### 1. Authentication Tests

#### Service Layer (`authService.test.ts`)
- ✅ User registration (success/failure)
- ✅ User login (success/failure)
- ✅ User logout
- ✅ Get current user
- ✅ Input validation (email format, password length)

#### Screen Components
- ✅ **LoginScreen** (`LoginScreen.test.tsx`)
  - Form rendering
  - Input validation
  - Password visibility toggle
  - Navigation to register
  - Loading states
  - Error handling

- ✅ **RegisterScreen** (`RegisterScreen.test.tsx`)
  - Form rendering
  - Input validation
  - Password confirmation matching
  - Navigation to login
  - Loading states
  - Error handling

#### Redux State Management (`authSlice.test.ts`)
- ✅ Login actions (pending/fulfilled/rejected)
- ✅ Register actions (pending/fulfilled/rejected)
- ✅ Logout actions
- ✅ Profile update actions
- ✅ Error handling and state transitions

### 2. Prayer Functionality Tests

#### Service Layer (`prayerService.test.ts`)
- ✅ Create prayer request
- ✅ Fetch prayer requests (with filters)
- ✅ Fetch user's own requests
- ✅ Update prayer request
- ✅ Delete prayer request
- ✅ Authentication checks

### 3. Component Tests

#### Test Utilities (`test-utils.tsx`)
- ✅ Redux store setup with all slices
- ✅ Navigation mocking
- ✅ React Native Paper theme setup
- ✅ Safe area provider setup
- ✅ Test data factories

## 🛠️ Testing Best Practices

### 1. Test Organization

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature', () => {
    it('should do something when condition is met', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 2. Mocking Strategy

```typescript
// Mock external dependencies
jest.mock('@/services/authService', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  // ... other navigation methods
};
```

### 3. Async Testing

```typescript
it('should handle async operations', async () => {
  const { getByText } = renderWithProviders(<Component />);
  
  fireEvent.press(getByText('Submit'));
  
  await waitFor(() => {
    expect(mockService.method).toHaveBeenCalled();
  });
});
```

### 4. User Interaction Testing

```typescript
it('should handle user input', () => {
  const { getByPlaceholderText } = renderWithProviders(<Component />);
  
  const input = getByPlaceholderText('Email');
  fireEvent.changeText(input, 'test@example.com');
  
  expect(input.props.value).toBe('test@example.com');
});
```

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|...)/)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Jest Setup (`jest.setup.js`)

- React Native Reanimated mocking
- Vector icons mocking
- Maps mocking
- OneSignal mocking
- AsyncStorage mocking
- Environment variables mocking
- Supabase mocking

## 📊 Test Coverage Report

After running `npm run test:coverage`, you'll get a detailed report showing:

- **Statements**: Percentage of statements executed
- **Branches**: Percentage of branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 70% | TBD |
| Branches | 70% | TBD |
| Functions | 70% | TBD |
| Lines | 70% | TBD |

## 🐛 Common Testing Issues

### 1. MaterialCommunityIcons Issues
**Problem**: "Cannot read property 'jsx' of undefined"
**Solution**: Icons are mocked in `jest.setup.js`

### 2. Navigation Testing
**Problem**: Navigation methods not working in tests
**Solution**: Use `mockNavigation` from `test-utils.tsx`

### 3. Async Operations
**Problem**: Tests failing due to async operations
**Solution**: Use `waitFor()` and proper async/await patterns

### 4. Redux State Testing
**Problem**: Store not properly configured
**Solution**: Use `renderWithProviders()` from `test-utils.tsx`

## 🚀 Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## 📝 Adding New Tests

### 1. For New Components

```typescript
// __tests__/components/NewComponent.test.tsx
import React from 'react';
import { renderWithProviders } from '../utils/test-utils';
import NewComponent from '../../src/components/NewComponent';

describe('NewComponent', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<NewComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

### 2. For New Services

```typescript
// __tests__/services/newService.test.ts
import { newService } from '../../src/services/newService';

jest.mock('../../src/services/newService', () => ({
  newService: {
    method: jest.fn(),
  },
}));

describe('NewService', () => {
  it('should perform expected operation', async () => {
    // Test implementation
  });
});
```

### 3. For New Redux Slices

```typescript
// __tests__/store/slices/newSlice.test.ts
import newReducer, { actions } from '../../../src/store/slices/newSlice';

describe('NewSlice', () => {
  it('should handle action', () => {
    const state = newReducer(initialState, action);
    expect(state.property).toBe(expectedValue);
  });
});
```

## 🎯 Test-Driven Development (TDD)

### Workflow

1. **Write failing test** - Define expected behavior
2. **Write minimal code** - Make test pass
3. **Refactor** - Improve code while keeping tests green
4. **Repeat** - Continue for next feature

### Example TDD Cycle

```typescript
// 1. Write failing test
it('should validate email format', () => {
  const result = validateEmail('invalid-email');
  expect(result).toBe(false);
});

// 2. Write minimal implementation
const validateEmail = (email: string) => {
  return email.includes('@');
};

// 3. Add more test cases
it('should accept valid email', () => {
  const result = validateEmail('test@example.com');
  expect(result).toBe(true);
});

// 4. Improve implementation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 📚 Additional Resources

- [React Native Testing Library Documentation](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Redux Toolkit Testing](https://redux-toolkit.js.org/usage/writing-tests)
- [React Navigation Testing](https://reactnavigation.org/docs/testing/)

## 🤝 Contributing to Tests

1. **Follow naming conventions**: `ComponentName.test.tsx` for components
2. **Use descriptive test names**: "should handle user login successfully"
3. **Test both success and failure cases**
4. **Mock external dependencies**
5. **Maintain test coverage above 70%**
6. **Update this documentation** when adding new test patterns

---

**Remember**: Good tests are like documentation that never gets outdated. They help catch bugs early and make refactoring safer! 🎉 