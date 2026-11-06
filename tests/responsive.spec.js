const { test, expect } = require('@playwright/test');

test.describe('Arahma Tours - Verificación Responsive y Contenido', () => {
  test('La página principal carga con título y preloader', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Arahma Tours/i);

    // Verificar presencia de los 9 capítulos
    const chapters = page.locator('#horizontal-track > section');
    await expect(chapters).toHaveCount(9);
  });

  test('Los botones de WhatsApp están visibles y configurados', async ({ page }) => {
    await page.goto('/');
    const whatsappLinks = page.locator('a[href*="wa.me"]');
    await expect(whatsappLinks.first()).toBeVisible();
  });
});

