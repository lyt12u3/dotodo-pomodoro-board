# Testing Documentation

This directory contains comprehensive tests for the Pomodoro Task Board application. The tests are organized by type and functionality to ensure complete coverage of the application's features.

# Test Structure

This directory contains all tests for the application, organized by type:

## Directory Structure

```
__tests__/
├── e2e/                 # End-to-end tests using Cypress
│   ├── task/           # Task-related E2E tests
│   ├── pomodoro/       # Pomodoro-related E2E tests
│   └── settings/       # Settings-related E2E tests
├── unit/               # Unit tests using Jest/Vitest
│   ├── components/     # Component unit tests
│   ├── stores/        # Zustand store unit tests
│   └── utils/         # Utility function unit tests
└── functional/         # Functional and security tests
    ├── validation/    # Data validation tests
    └── security/      # Security-related tests

```

## Test Types

### E2E Tests (Cypress)
End-to-end tests that simulate real user interactions with the application. These tests run in a browser environment and test the application as a whole.

### Unit Tests (Jest/Vitest)
Tests for individual components, functions, and stores in isolation. These tests ensure that each unit of code works correctly on its own.

### Functional/Security Tests
Tests that focus on data validation, security measures, and business logic. These tests ensure that the application handles data correctly and securely.

## Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:open

# Run tests with coverage
npm run test:coverage
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking Time**: Use `vi.advanceTimersByTime()` for time-dependent tests
3. **Cleanup**: Reset state between tests using `beforeEach` and `afterEach`
4. **Assertions**: Use specific assertions to check exact conditions
5. **Data Attributes**: Use `data-testid` for reliable element selection

## Common Testing Patterns

### Testing Timer Updates
```typescript
// Start timer and advance time
fireEvent.click(startButton);
act(() => {
  vi.advanceTimersByTime(1000);
});
expect(screen.getByText('24:59')).toBeInTheDocument();
```

### Testing Mode Transitions
```typescript
// Complete work session
act(() => {
  vi.advanceTimersByTime(25 * 60 * 1000);
});
expect(screen.getByText(/break/i)).toBeInTheDocument();
```

### Testing Cycle Counting
```typescript
// Complete multiple cycles
for (let i = 0; i < 5; i++) {
  act(() => {
    vi.advanceTimersByTime(workTime);
    vi.advanceTimersByTime(breakTime);
  });
}
expect(Number(cycleCount.textContent)).toBeGreaterThan(3);
```

## Adding New Tests

When adding new tests:
1. Place in appropriate directory based on test type
2. Follow existing naming conventions
3. Include detailed comments explaining test purpose
4. Use consistent patterns for time manipulation
5. Add new test documentation to this README

## Coverage Goals

- Unit Tests: 90%+ coverage
- Integration Tests: Key component interactions
- E2E Tests: Critical user paths
- Stress Tests: Edge cases and performance limits 