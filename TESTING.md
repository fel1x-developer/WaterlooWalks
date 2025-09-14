# Testing Guide for WaterlooWalks

This project uses Jest and React Native Testing Library for testing.

## Setup

Testing dependencies are already installed:
- `jest-expo` - Jest preset for Expo projects
- `@testing-library/react-native` - React Native testing utilities
- `@testing-library/jest-native` - Additional Jest matchers
- `@types/jest` - TypeScript types for Jest
- `ts-node` - TypeScript support for Jest config

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test -- --coverage
```

## Test Structure

Tests are organized in the `__tests__` directory:

```
__tests__/
├── setup.ts              # Test setup and global mocks
├── algorithm/             # Algorithm tests
│   └── types.test.ts
├── components/            # Component tests
│   └── DirectionsListItem.test.tsx
├── utils/                 # Utility function tests
│   └── locations.test.ts
└── app/                   # Screen/page tests
    └── index.test.tsx
```

## Configuration

- **Jest Config**: `jest.config.ts` - TypeScript configuration
- **Setup File**: `__tests__/setup.ts` - Global mocks and test setup
- **Test Patterns**: `*.test.{ts,tsx}` files in the `__tests__` directory

## Example Tests

### Component Testing
```typescript
import { render } from '@testing-library/react-native';
import DirectionsListItem from '../../src/components/DirectionsListItem';

it('should render direction text', () => {
  const { getByText } = render(<DirectionsListItem {...props} />);
  expect(getByText('Go to MC floor 2')).toBeTruthy();
});
```

### Utility Function Testing
```typescript
import { getBuildingOptions } from '../../src/utils/locations';

it('should return sorted building options', () => {
  const options = getBuildingOptions(buildingFloors);
  expect(options).toBeInstanceOf(Array);
  expect(options.length).toBeGreaterThan(0);
});
```

## Mocking

Common mocks are set up in `__tests__/setup.ts`:
- `react-native-maps` - Mocked for testing without native dependencies
- `expo-location` - Mocked in individual test files
- `@react-native-picker/picker` - Mocked for picker components

## Coverage

The project is configured to collect coverage from:
- `src/**/*.{ts,tsx}` files
- Excludes type definition files

## Known Issues

### Act() Warnings
You may see warnings like "An update to Component inside a test was not wrapped in act(...)". This is common with async useEffect hooks and doesn't affect test functionality. The tests will still pass and work correctly.

## Best Practices

1. **Mock Native Dependencies**: Always mock native modules like maps, location, etc.
2. **Test User Interactions**: Focus on testing user-facing behavior
3. **Use TypeScript**: Leverage TypeScript for type-safe tests
4. **Organize Tests**: Mirror the source structure in test directories
5. **Test Edge Cases**: Include tests for error states and edge cases
6. **Use waitFor**: For async operations, always use `waitFor` to wait for state changes