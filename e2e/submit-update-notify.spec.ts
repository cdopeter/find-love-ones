import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Submit → Update → Notify Flow', () => {
  test('should complete full flow: submit request, view in dashboard, update status', async ({
    page,
  }) => {
    // Step 1: Navigate to request form
    await page.goto('/request');

    // Verify the form page loads
    await expect(
      page.getByRole('heading', { name: /submit a request/i })
    ).toBeVisible();

    // Step 2: Fill out and submit the form
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/last seen location/i).fill('Downtown Kingston');

    // Select parish
    await page.getByLabel(/parish/i).click();
    await page.getByRole('option', { name: 'Kingston' }).click();

    // Fill contact information
    await page.getByLabel(/your name/i).fill('Jane Smith');
    await page.getByLabel(/phone number/i).fill('876-555-1234');
    await page.getByLabel(/email/i).fill('jane@example.com');

    // Submit the form
    await page.getByRole('button', { name: /submit request/i }).click();

    // Step 3: Verify success message (Notify)
    await expect(page.getByText(/request submitted successfully/i)).toBeVisible(
      { timeout: 10000 }
    );

    // Get tracking code
    const trackingCodeElement = page.locator('[style*="monospace"]').first();
    await expect(trackingCodeElement).toBeVisible();
    const trackingCode = await trackingCodeElement.textContent();
    expect(trackingCode).toBeTruthy();
    expect(trackingCode!.length).toBeGreaterThan(0);

    // Verify tracking code can be copied
    await expect(
      page.getByRole('button', { name: /copy tracking code/i })
    ).toBeVisible();

    // Step 4: Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(
      page.getByRole('heading', { name: /responder dashboard/i })
    ).toBeVisible();

    // Verify the table loads with data
    await page.waitForSelector('table', { timeout: 10000 });

    // The newly created request should be visible in the table
    // (it's at the top since we sort by created_at descending)
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();

    // Click on the first row to open the detail drawer
    await firstRow.click();

    // Step 5: Verify detail drawer opens with person information
    await expect(page.getByText('Person Details')).toBeVisible();
    await expect(page.getByText('John')).toBeVisible();
    await expect(page.getByText('Doe')).toBeVisible();
    await expect(page.getByText('Downtown Kingston')).toBeVisible();

    // Step 6: Update status
    const statusSelect = page.locator('select, [role="combobox"]').first();
    await statusSelect.click();
    await page.getByRole('option', { name: /found/i }).click();

    // Verify status update notification
    await expect(page.getByText(/status updated successfully/i)).toBeVisible({
      timeout: 5000,
    });

    // Close the drawer
    await page.getByRole('button', { name: /close/i }).click();

    // Verify drawer is closed
    await expect(page.getByText('Person Details')).not.toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/request');

    // Try to submit empty form
    await page.getByRole('button', { name: /submit request/i }).click();

    // Verify validation errors appear
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();
  });

  test('should allow filtering by parish in dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(
      page.getByRole('heading', { name: /responder dashboard/i })
    ).toBeVisible();

    // Select a parish filter
    await page.getByLabel(/filter by parish/i).click();
    await page.getByRole('option', { name: 'Kingston' }).click();

    // Verify the filter is applied
    await expect(page.getByLabel(/filter by parish/i)).toHaveValue('Kingston');
  });

  test('should pass accessibility checks on request page', async ({ page }) => {
    await page.goto('/request');

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility checks on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Run axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
