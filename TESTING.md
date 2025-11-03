# Testing Guide

This project uses a comprehensive testing strategy with multiple tools to ensure quality and reliability.

## Testing Stack

- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end browser testing
- **Lighthouse CI** - Performance and accessibility auditing
- **GitHub Actions** - Continuous Integration

## Running Tests

### Unit & Component Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug
```

### Type Checking & Linting

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Check formatting
npm run format:check

# Format code
npm run format
```

### Lighthouse CI

```bash
# Run Lighthouse audits
npm run lighthouse
```

## Test Structure

### Component Tests

Located in `src/components/__tests__/`, component tests verify:
- Component rendering
- User interactions
- Props handling
- State management
- Error states

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### E2E Tests

Located in `e2e/`, end-to-end tests verify:
- Complete user flows
- Multi-page interactions
- Form submissions
- Data persistence
- Accessibility compliance

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('submit form flow', async ({ page }) => {
  await page.goto('/request');
  await page.fill('[name="firstName"]', 'John');
  await page.click('button[type="submit"]');
  await expect(page.getByText('Success')).toBeVisible();
});
```

## Coverage Targets

- **Unit/Component Tests:** >80% coverage
- **E2E Tests:** Critical user flows
- **Performance:** Lighthouse score ≥85
- **Accessibility:** Lighthouse score ≥95

## GitHub Actions CI

The CI pipeline runs on every push and pull request:

1. **Type Check** - Validates TypeScript types
2. **Lint** - Checks code quality and formatting
3. **Unit Tests** - Runs component tests with coverage
4. **E2E Tests** - Runs Playwright browser tests
5. **Lighthouse CI** - Audits performance and accessibility

### Workflow Configuration

See `.github/workflows/ci.yml` for the complete CI configuration.

### Required Secrets

The following secrets must be configured in GitHub:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `CODECOV_TOKEN` (optional) - For coverage reporting

## Test Files

### Component Tests
- `src/components/__tests__/RequestForm.test.tsx` - Form validation and submission
- `src/components/__tests__/RequestSuccess.test.tsx` - Success message display
- `src/components/__tests__/PersonDetailDrawer.test.tsx` - Detail drawer functionality

### E2E Tests
- `e2e/submit-update-notify.spec.ts` - Complete submit→update→notify flow

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `lighthouserc.json` - Lighthouse CI configuration
- `src/test/setup.ts` - Test environment setup

## Writing New Tests

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user flow', async ({ page }) => {
    await page.goto('/page');
    
    // Interact with page
    await page.fill('input[name="field"]', 'value');
    await page.click('button[type="submit"]');
    
    // Assert results
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use accessible queries** (getByRole, getByLabelText)
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - API calls, timers, etc.
5. **Test error states** - Don't just test the happy path
6. **Write descriptive test names** - Clearly state what is being tested
7. **Follow AAA pattern** - Arrange, Act, Assert

## Debugging Tests

### Component Tests
```bash
# Run specific test file
npm test -- RequestForm.test.tsx

# Run in UI mode for debugging
npm run test:ui
```

### E2E Tests
```bash
# Run with visible browser
npm run test:e2e:debug

# Run specific test
npx playwright test submit-update-notify.spec.ts
```

## Troubleshooting

### Tests timing out
- Increase timeout in test configuration
- Check for async operations not being awaited
- Verify mocks are set up correctly

### Accessibility violations
- Review Lighthouse CI report
- Use axe DevTools browser extension
- Check ARIA labels and semantic HTML

### Flaky tests
- Add proper wait conditions
- Avoid hardcoded timeouts
- Ensure test isolation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
