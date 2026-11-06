const { test, expect } = require('@playwright/test');

test.describe('Arahma Tours - Flujos Interactivos y Componentes', () => {

  test('El selector de idiomas despliega las 8 banderas y permite cambiar de idioma', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const langBtn = page.locator('#lang-dropdown-btn');
    const langMenu = page.locator('#lang-dropdown-menu');
    await expect(langBtn).toBeVisible();

    // Abrir menú de idiomas
    await langBtn.click();
    await expect(langMenu).toBeVisible();

    // Verificar las 8 banderas disponibles
    const langOptions = page.locator('.lang-option');
    await expect(langOptions).toHaveCount(8);

    // Seleccionar Árabe y verificar atributos
    const arabicOption = page.locator('button[data-lang="ar"]');
    await arabicOption.click();
    await expect(langMenu).toBeHidden();
  });

  test('El acordeón de preguntas frecuentes (Capítulo 08) se expande y contrae', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Localizar primer botón de FAQ
    const firstFaqBtn = page.locator('#faq-accordion button').first();
    const firstFaqContent = page.locator('#faq-accordion button + div').first();

    await expect(firstFaqContent).toHaveClass(/hidden/);

    // Desplegar FAQ
    await firstFaqBtn.click();
    await expect(firstFaqContent).not.toHaveClass(/hidden/);
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');

    // Volver a contraer
    await firstFaqBtn.click();
    await expect(firstFaqContent).toHaveClass(/hidden/);
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('Navegación horizontal de escritorio: botones previo y siguiente', async ({ page }) => {
    // Solo aplica a perfiles desktop
    const viewport = page.viewportSize();
    if (!viewport || viewport.width <= 1024) {
      test.skip();
    }

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const nextBtn = page.locator('#next-chapter-btn');
    const prevBtn = page.locator('#prev-chapter-btn');
    const chapterLabel = page.locator('#chapter-indicator-label');

    await expect(nextBtn).toBeVisible();
    await expect(prevBtn).toBeVisible();
    await expect(chapterLabel).toContainText('Capítulo 01');

    // Navegar al siguiente capítulo
    await nextBtn.click();
    await page.waitForTimeout(600); // Esperar animación suave

    // Verificar que el indicador se actualiza
    await expect(chapterLabel).toContainText('Capítulo 02');
  });

  test('Capítulo 06: Botón de reserva por WhatsApp está visible y contiene texto correcto', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cap06 = page.locator('#capitulo-06');
    await expect(cap06).toBeAttached();

    const bookingBtn = cap06.locator('a[href*="wa.me"]').first();
    await expect(bookingBtn).toBeAttached();
    await expect(bookingBtn).toHaveAttribute('href', /wa\.me\/34674083320/);
  });
});

