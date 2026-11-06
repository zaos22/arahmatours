const { test, expect } = require('@playwright/test');

// Matriz exhaustiva de resoluciones más comunes, recientes y utilizadas a nivel mundial
const RESOLUTIONS = [
  // --- MÓVILES (Smartphones) ---
  { name: 'Mobile - Samsung Galaxy / Android Estándar', width: 360, height: 800, type: 'mobile' },
  { name: 'Mobile - iPhone SE / Compacto', width: 375, height: 667, type: 'mobile' },
  { name: 'Mobile - iPhone 12/13/14/15/16', width: 390, height: 844, type: 'mobile' },
  { name: 'Mobile - Galaxy S22/S23/S24 Ultra', width: 412, height: 915, type: 'mobile' },
  { name: 'Mobile - iPhone Pro Max / Plus', width: 430, height: 932, type: 'mobile' },

  // --- TABLETS ---
  { name: 'Tablet - iPad / Tablet Portrait', width: 768, height: 1024, type: 'tablet' },
  { name: 'Tablet - iPad Mini / Air Landscape', width: 1024, height: 768, type: 'tablet-landscape' },
  { name: 'Tablet - iPad Pro 11" Portrait', width: 834, height: 1194, type: 'tablet' },

  // --- PORTÁTILES (Laptops & Compact Screens) ---
  { name: 'Laptop - WXGA / 720p', width: 1280, height: 720, type: 'desktop-compact' },
  { name: 'Laptop - Mac 13" / 16:10', width: 1280, height: 800, type: 'desktop-compact' },
  { name: 'Laptop - 1366x768 (Líder mundial portátil)', width: 1366, height: 768, type: 'desktop-compact' },
  { name: 'Laptop - MacBook Air / Pro 14"', width: 1440, height: 900, type: 'desktop-compact' },
  { name: 'Laptop - Windows 1080p con 125% escala', width: 1536, height: 864, type: 'desktop' },
  { name: 'Laptop - HD+ Widescreen', width: 1600, height: 900, type: 'desktop' },

  // --- ESCRITORIO (Full HD & High Res) ---
  { name: 'Desktop - Full HD 1080p (Estándar #1 Desktop)', width: 1920, height: 1080, type: 'desktop-large' },
  { name: 'Desktop - 2K / QHD', width: 2560, height: 1440, type: 'desktop-large' },
  { name: 'Desktop - 4K UHD', width: 3840, height: 2160, type: 'desktop-large' },
];

test.describe('Arahma Tours — Suite Integral de Responsive Multi-Dispositivo', () => {

  for (const res of RESOLUTIONS) {
    test.describe(`${res.name} (${res.width}x${res.height})`, () => {
      
      test.use({ viewport: { width: res.width, height: res.height } });

      test('Carga completa, título, preloader y estructura base', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveTitle(/Arahma Tours/i);

        // Canvas de fondo inmersivo presente
        const canvas = page.locator('#hero-canvas');
        await expect(canvas).toBeAttached();

        // Los 9 capítulos existen en el DOM
        const chapters = page.locator('#horizontal-track > section');
        await expect(chapters).toHaveCount(9);
      });

      test('Header y navegación se adaptan sin desbordamiento horizontal en el body', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const header = page.locator('header');
        await expect(header).toBeVisible();

        // El selector de idioma es visible y utilizable
        const langBtn = page.locator('#lang-dropdown-btn');
        await expect(langBtn).toBeVisible();

        // Verificación de desbordamiento horizontal indeseado en la ventana
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth).toBeLessThanOrEqual(windowWidth + 2); // margen de 2px por redondeo de subpíxeles
      });

      test('Capítulo 01: Título hero, badges y CTA de WhatsApp son legibles', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const cap01 = page.locator('#capitulo-01');
        await expect(cap01).toBeVisible();

        const heroTitle = cap01.locator('h1');
        await expect(heroTitle).toBeVisible();

        const heroWhatsappBtn = cap01.locator('a[href*="wa.me"]').first();
        await expect(heroWhatsappBtn).toBeVisible();
      });

      test('Capítulo 05 (Qué Incluye): Bento grid contiene las 6 tarjetas de viaje completas', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const cap05 = page.locator('#capitulo-05');
        await expect(cap05).toBeAttached();

        // 6 tarjetas de beneficios
        const cards = cap05.locator('.grid > div');
        await expect(cards).toHaveCount(6);
      });

      test('Capítulo 06 (Fechas y Precios): Los 2 paquetes muestran tarifas y enlace WhatsApp directo', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const cap06 = page.locator('#capitulo-06');
        await expect(cap06).toBeAttached();

        // Los 2 módulos de precios
        const pricingBoxes = cap06.locator('.grid > div');
        await expect(pricingBoxes).toHaveCount(2);

        // Botones de consulta WhatsApp
        const waBtns = cap06.locator('a[href*="wa.me"]');
        await expect(waBtns).toHaveCount(2);
      });

      test('Capítulo 08 (FAQ): El acordeón funciona correctamente', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const firstFaqBtn = page.locator('#faq-accordion button').first();
        const firstFaqContent = page.locator('#faq-accordion button + div').first();

        // Expansión interactiva
        await firstFaqBtn.click();
        await expect(firstFaqContent).not.toHaveClass(/hidden/);

        // Contracción
        await firstFaqBtn.click();
        await expect(firstFaqContent).toHaveClass(/hidden/);
      });

      test('Capítulo 09 (Contacto): Módulo final de WhatsApp e Instagram presente', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const cap09 = page.locator('#capitulo-09');
        await expect(cap09).toBeAttached();

        const contactWaBtn = cap09.locator('a[href*="wa.me"]').first();
        await expect(contactWaBtn).toBeAttached();
        await expect(contactWaBtn).toHaveAttribute('href', /wa\.me\/34674083320/);
      });

      if (res.type.startsWith('desktop')) {
        test('Modo horizontal PC: Aside de navegación inferior y controles visibles', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });

          const aside = page.locator('aside');
          await expect(aside).toBeVisible();

          const prevBtn = page.locator('#prev-chapter-btn');
          const nextBtn = page.locator('#next-chapter-btn');
          const planeIndicator = page.locator('#progress-plane-indicator');

          await expect(prevBtn).toBeVisible();
          await expect(nextBtn).toBeVisible();
          await expect(planeIndicator).toBeVisible();
        });
      } else {
        test('Modo móvil/tablet: Aside horizontal oculto para maximizar pantalla táctil', async ({ page }) => {
          await page.goto('/', { waitUntil: 'domcontentloaded' });

          const aside = page.locator('aside');
          await expect(aside).toBeHidden();
        });
      }

    });
  }
});

