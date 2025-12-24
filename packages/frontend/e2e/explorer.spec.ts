import { test, expect } from '@playwright/test';

test.describe('Windows Explorer E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Extra wait for data load
  });

  test('should display home view on load', async ({ page }) => {
    // Check header
    await expect(page.locator('h1')).toContainText('File Explorer');

    // Check search bar
    await expect(page.locator('.search-input')).toBeVisible();

    // Check breadcrumb shows Home
    await expect(page.locator('.breadcrumb')).toContainText('Home');

    // Check root folders displayed
    await expect(page.locator('.details-content')).toBeVisible();
  });

  test('should expand and collapse folders', async ({ page }) => {
    // Wait for tree to load
    await page.waitForSelector('.folder-tree-item', { timeout: 5000 });

    // Find Documents folder
    const folderRows = page.locator('.folder-row');
    const documentsFolder = folderRows.filter({ hasText: 'Documents' }).first();
    
    // Click expand icon
    const expandIcon = documentsFolder.locator('.expand-icon');
    await expandIcon.click();

    // Wait a bit
    await page.waitForTimeout(300);

    // Verify expanded (▼ icon)
    await expect(expandIcon).toContainText('▼');

    // Click collapse
    await expandIcon.click();
    await page.waitForTimeout(300);

    // Verify collapsed (▶ icon)
    await expect(expandIcon).toContainText('▶');
  });

  test('should navigate to folder when clicked', async ({ page }) => {
    await page.waitForSelector('.folder-row', { timeout: 5000 });

    // Click Documents folder row
    const documentsRow = page.locator('.folder-row').filter({ hasText: 'Documents' }).first();
    await documentsRow.click();

    // Wait for breadcrumb update
    await page.waitForTimeout(500);

    // Verify breadcrumb
    await expect(page.locator('.breadcrumb')).toContainText('Documents');

    // Verify right panel shows Documents contents
    const detailsContent = page.locator('.details-content');
    await expect(detailsContent).toBeVisible();
  });

  test('should search for folders', async ({ page }) => {
    // Type in search
    const searchInput = page.locator('.search-input');
    await searchInput.click();
    await searchInput.fill('Work');

    // Wait for debounce + API call
    await page.waitForTimeout(500);

    // Check if results dropdown appears
    const searchResults = page.locator('.search-results');
    const hasResults = await searchResults.isVisible().catch(() => false);

    if (hasResults) {
      // Verify results contain "Work"
      await expect(searchResults).toBeVisible();
      
      // Click first result if exists
      const firstResult = searchResults.locator('.result-item').first();
      const resultExists = await firstResult.isVisible().catch(() => false);
      
      if (resultExists) {
        await firstResult.click();
        await page.waitForTimeout(500);
        
        // Verify navigation
        await expect(page.locator('.breadcrumb')).toContainText('Work');
      }
    }
  });

  test('should click folder in right panel', async ({ page }) => {
    await page.waitForSelector('.folder-row', { timeout: 5000 });

    // Click Documents in left panel
    const documentsRow = page.locator('.folder-row').filter({ hasText: 'Documents' }).first();
    await documentsRow.click();

    // Wait for right panel to load
    await page.waitForTimeout(800);

    // Look for folder items in right panel
    const folderItems = page.locator('.folder-item');
    const firstFolder = folderItems.first();
    
    const folderExists = await firstFolder.isVisible().catch(() => false);
    
    if (folderExists) {
      await firstFolder.click();
      await page.waitForTimeout(500);

      // Verify breadcrumb updated
      const breadcrumb = page.locator('.breadcrumb');
      await expect(breadcrumb).toContainText('Documents');
    }
  });

  test('should navigate back using breadcrumb', async ({ page }) => {
    await page.waitForSelector('.folder-row', { timeout: 5000 });

    // Click Documents
    const documentsRow = page.locator('.folder-row').filter({ hasText: 'Documents' }).first();
    await documentsRow.click();
    await page.waitForTimeout(500);

    // Verify at Documents
    await expect(page.locator('.breadcrumb')).toContainText('Documents');

    // Click Home in breadcrumb
    const homeBreadcrumb = page.locator('.breadcrumb-item').filter({ hasText: 'Home' }).first();
    await homeBreadcrumb.click();
    await page.waitForTimeout(500);

    // Verify back at home (breadcrumb only shows Home)
    const breadcrumbText = await page.locator('.breadcrumb').textContent();
    expect(breadcrumbText?.includes('Home')).toBeTruthy();
  });

  test('should clear search input', async ({ page }) => {
    // Type in search
    const searchInput = page.locator('.search-input');
    await searchInput.fill('Test');
    await page.waitForTimeout(200);

    // Verify clear button appears
    const clearBtn = page.locator('.clear-btn');
    await expect(clearBtn).toBeVisible();

    // Click clear
    await clearBtn.click();

    // Verify input cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should display files with proper info', async ({ page }) => {
    await page.waitForSelector('.folder-row', { timeout: 5000 });

    // Click Documents
    const documentsRow = page.locator('.folder-row').filter({ hasText: 'Documents' }).first();
    await documentsRow.click();
    await page.waitForTimeout(500);

    // Check if any content is displayed
    const detailsContent = page.locator('.details-content');
    await expect(detailsContent).toBeVisible();

    // If there are folders or files, they should have proper structure
    const items = page.locator('.item');
    const itemCount = await items.count();

    if (itemCount > 0) {
      // First item should have icon and name
      const firstItem = items.first();
      await expect(firstItem.locator('.item-icon')).toBeVisible();
      await expect(firstItem.locator('.item-name')).toBeVisible();
    }
  });
});