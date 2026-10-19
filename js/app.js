/**
 * Arahma Tours - Experiencia Inmersiva & Hero Scroll Trigger Animation
 * Renders sequential image frames (000 to 540) on high-performance Canvas.
 * Synchronized with horizontal track in PC desktop and vertical scroll in mobile/portrait.
 */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('horizontal-track');
  if (!track) return;

  const chapters = Array.from(track.querySelectorAll('section'));
  const totalChapters = chapters.length;

  const navLinks = document.querySelectorAll('header nav a[data-path]');
  const prevBtn = document.getElementById('prev-chapter-btn');
  const nextBtn = document.getElementById('next-chapter-btn');
  const progressBar = document.getElementById('progress-bar-fill');
  const planeIndicator = document.getElementById('progress-plane-indicator');
  const chapterLabel = document.getElementById('chapter-indicator-label');
  const chapterDots = document.querySelectorAll('.chapter-dot');

  // Check if viewport is horizontal PC mode
  function isHorizontalMode() {
    return window.innerWidth > 1024 && window.matchMedia('(orientation: landscape)').matches;
  }

  /* ========================================================= */
  /* 1. HERO SEQUENTIAL IMAGE CANVAS ENGINE                    */
  /* ========================================================= */
  const canvas = document.getElementById('hero-canvas');
  const canvasWrapper = document.getElementById('hero-canvas-wrapper');
  const sitePreloader = document.getElementById('site-preloader');
  const preloaderBar = document.getElementById('preloader-progress-bar');
  const preloaderText = document.getElementById('preloader-status-text');

  let renderFrame = () => {};

  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const frameCount = 541; // ezgif-frame-000.jpg to ezgif-frame-540.jpg
    const frameSkip = 2;   // Load every 2nd frame for 60fps responsiveness
    const images = new Map();
    let currentFrameIndex = 0;

    const getFramePath = (index) => {
      const padded = String(index).padStart(3, '0');
      return `assets/hero/ezgif-frame-${padded}.jpg`;
    };

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderFrame(currentFrameIndex);
    }

    renderFrame = (index, transitionBlend = 0) => {
      currentFrameIndex = index;
      const img = images.get(index) || images.get(0);
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const ox = (cw - nw) / 2;
      const oy = (ch - nh) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Si estamos en la transición inicial suave entre el frame 0 y los primeros frames (0 a 1)
      const baseImg0 = images.get(0);
      if (transitionBlend > 0 && transitionBlend < 1 && baseImg0 && baseImg0.complete && index !== 0) {
        // 1. Dibujar el fotograma 000 base perfecto de fondo
        ctx.globalAlpha = 1;
        ctx.filter = 'none';
        ctx.drawImage(baseImg0, ox, oy, nw, nh);

        // 2. Sobreponer con fundido gradual el fotograma destino suavizado
        ctx.globalAlpha = transitionBlend;
        ctx.filter = 'blur(0.5px) contrast(104%) brightness(95%) saturate(106%)';
        ctx.drawImage(img, ox, oy, nw, nh);
        ctx.globalAlpha = 1;
        ctx.filter = 'none';
        return;
      }

      // Renderizado normal: micro-blur subpíxel (0.45px) elimina el pixelado y ruido JPEG sin perder nitidez general
      if (index > 0) {
        ctx.filter = 'blur(0.45px) contrast(104%) brightness(95%) saturate(106%)';
      } else {
        ctx.filter = 'none';
      }

      ctx.globalAlpha = 1;
      ctx.drawImage(img, ox, oy, nw, nh);
      ctx.filter = 'none';
    };

    // Load first frame
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      images.set(0, firstImg);
      resizeCanvas();
    };

    // Progressive frame preloading
    let loadedCount = 0;
    const framesToPreload = [];
    for (let i = 0; i < frameCount; i += frameSkip) {
      if (i !== 0) framesToPreload.push(i);
    }
    if (!framesToPreload.includes(540)) framesToPreload.push(540);
    const totalToLoad = framesToPreload.length;

    const preloaderStartTime = Date.now();
    const minPreloaderDuration = 1800; // Al menos 1.8 segundos para una experiencia cinematográfica

    function hidePreloader() {
      if (sitePreloader && !sitePreloader.dataset.hidden) {
        const elapsedTime = Date.now() - preloaderStartTime;
        const remainingTime = Math.max(0, minPreloaderDuration - elapsedTime);

        setTimeout(() => {
          if (sitePreloader.dataset.hidden) return;
          sitePreloader.dataset.hidden = 'true';
          if (preloaderBar) preloaderBar.style.width = '100%';
          if (preloaderText) preloaderText.textContent = '¡Bienvenido a Arahma Tours!';
          setTimeout(() => {
            sitePreloader.style.opacity = '0';
            setTimeout(() => sitePreloader.remove(), 750);
          }, 450);
        }, remainingTime);
      }
    }

    // Dismiss preloader once enough initial frames are loaded and minimum duration is fulfilled
    function checkInitialReady() {
      if (loadedCount >= 28 || loadedCount >= totalToLoad) {
        hidePreloader();
      }
    }

    function preloadNextBatch(startIndex = 0, batchSize = 12) {
      if (startIndex >= totalToLoad) {
        hidePreloader();
        return;
      }

      const endIndex = Math.min(startIndex + batchSize, totalToLoad);
      let batchLoaded = 0;
      const targetInBatch = endIndex - startIndex;

      for (let i = startIndex; i < endIndex; i++) {
        const frameIdx = framesToPreload[i];
        const img = new Image();
        img.src = getFramePath(frameIdx);
        img.onload = () => {
          images.set(frameIdx, img);
          loadedCount++;
          const progressPercent = Math.min(100, Math.round((loadedCount / totalToLoad) * 100));
          if (preloaderBar) preloaderBar.style.width = `${Math.max(15, progressPercent)}%`;
          if (preloaderText) preloaderText.textContent = `Preparando tu viaje (${progressPercent}%)`;

          checkInitialReady();

          batchLoaded++;
          if (batchLoaded === targetInBatch) {
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => preloadNextBatch(endIndex, batchSize));
            } else {
              setTimeout(() => preloadNextBatch(endIndex, batchSize), 16);
            }
          }
        };
        img.onerror = () => {
          batchLoaded++;
          checkInitialReady();
          if (batchLoaded === targetInBatch) {
            setTimeout(() => preloadNextBatch(endIndex, batchSize), 16);
          }
        };
      }
    }

    // Safety fallback: ensure preloader is dismissed after 3.5s maximum regardless of network speed
    setTimeout(hidePreloader, 3500);

    setTimeout(() => preloadNextBatch(0, 12), 100);

    function getClosestFrame(requestedFrame) {
      if (images.has(requestedFrame)) return requestedFrame;
      let closest = 0;
      let minDiff = Infinity;
      for (const k of images.keys()) {
        const diff = Math.abs(k - requestedFrame);
        if (diff < minDiff) {
          minDiff = diff;
          closest = k;
        }
      }
      return closest;
    }

    // Linear interpolation state for silky smooth 60fps frame scrubbing
    let targetProgress = 0;
    let currentProgress = 0;
    let isTicking = false;

    function smoothScrubLoop() {
      // Smooth lerp towards target scroll progress (0.08 factor for gentle momentum)
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.0001) {
        currentProgress += diff * 0.085;
      } else {
        currentProgress = targetProgress;
      }

      // El hero acompaña el fondo a lo largo de todas las secciones hasta llegar al final (Capítulo 09)
      // heroSpan: 0.88 para que los 540 frames se desarrollen de manera constante y pausada a lo largo del viaje
      const heroSpan = 0.88;
      const normalizedHeroProgress = Math.min(1, Math.max(0, currentProgress / heroSpan));
      const exactFrameFloat = normalizedHeroProgress * (frameCount - 1);
      const targetFrame = Math.round(exactFrameFloat);

      // Transición progresiva / cross-fade suave al inicio (entre fotograma 0 y 4)
      let initialBlend = 0;
      if (exactFrameFloat < 4) {
        initialBlend = Math.min(1, Math.max(0, exactFrameFloat / 4));
      }

      renderFrame(getClosestFrame(targetFrame), initialBlend);

      // Una vez se alcanza el final del recorrido (después del 88% del trayecto), la animación se disuelve
      // suavemente para dejar exclusivamente el color sólido profundo de fondo (--background: #001231)
      if (canvasWrapper) {
        if (currentProgress > 0.88) {
          const fadeOut = Math.max(0, 1 - (currentProgress - 0.88) / 0.10);
          canvasWrapper.style.opacity = String(fadeOut);
        } else {
          canvasWrapper.style.opacity = '1';
        }
      }

      if (Math.abs(diff) > 0.0001) {
        requestAnimationFrame(smoothScrubLoop);
      } else {
        isTicking = false;
      }
    }

    // Update Hero canvas animation based on scroll progress
    window.syncHeroAnimation = function(progress) {
      targetProgress = progress;
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(smoothScrubLoop);
      }
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();
  }

  /* ========================================================= */
  /* 2. NAVIGATION & SYNCHRONIZATION                           */
  /* ========================================================= */
  const navPathMap = {
    'inicio': 0,       // Cap 01: Hero
    'ruta': 1,         // Cap 02: Salida
    'meca': 2,         // Cap 03: La Meca
    'medina': 3,       // Cap 04: Medina
    'que-incluye': 4,  // Cap 05: Qué incluye
    'fechas': 5,       // Cap 06: Fechas y Precios
    'historia': 6,     // Cap 07: Nuestra Historia
    'faq': 7,          // Cap 08: Preguntas Frecuentes
    'contacto': 8      // Cap 09: Cierre y Contacto
  };

  function scrollToChapterIndex(index) {
    if (index < 0) index = 0;
    if (index >= totalChapters) index = totalChapters - 1;
    const targetSection = chapters[index];
    if (targetSection) {
      if (isHorizontalMode()) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      } else {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Mouse wheel: Vertical wheel converted to smooth horizontal scroll in PC mode with gentle step
  track.addEventListener('wheel', (e) => {
    if (!isHorizontalMode()) return;
    if (e.deltaY !== 0) {
      e.preventDefault();
      track.scrollBy({
        left: e.deltaY * 1.1,
        behavior: 'auto'
      });
    }
  }, { passive: false });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!isHorizontalMode()) return;

    if (e.key === 'ArrowRight') {
      track.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      track.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  });

  // Prev / Next Floating Controls in PC mode
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (isHorizontalMode()) {
        track.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (isHorizontalMode()) {
        track.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
      }
    });
  }

  // Header Nav Click Handlers
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path in navPathMap) {
        scrollToChapterIndex(navPathMap[path]);
      }
    });
  });

  // Main scroll state update function
  function updateScrollState() {
    let percent = 0;
    let currentChapter = 1;

    if (isHorizontalMode()) {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const currentScroll = track.scrollLeft;
      percent = maxScroll > 0 ? (currentScroll / maxScroll) : 0;
      
      // Identificar con precisión qué capítulo está centrado en pantalla
      const trackCenter = currentScroll + (window.innerWidth / 2);
      for (let i = 0; i < chapters.length; i++) {
        const secLeft = chapters[i].offsetLeft;
        const secRight = secLeft + chapters[i].offsetWidth;
        if (trackCenter >= secLeft && trackCenter < secRight) {
          currentChapter = i + 1;
          break;
        }
      }

      // Sync Bottom UI
      const percentInt = Math.min(100, Math.max(0, percent * 100));
      if (progressBar) progressBar.style.width = `${percentInt}%`;
      if (planeIndicator) planeIndicator.style.left = `${percentInt}%`;
      if (chapterLabel) chapterLabel.textContent = `Capítulo 0${currentChapter} / 0${totalChapters}`;

      // Chapter dots
      chapterDots.forEach((dot, idx) => {
        if (idx + 1 === currentChapter) {
          dot.classList.add('text-secondary', 'font-bold');
          dot.classList.remove('text-on-surface-variant');
        } else {
          dot.classList.remove('text-secondary', 'font-bold');
          dot.classList.add('text-on-surface-variant');
        }
      });
    } else {
      // Vertical mobile/portrait scroll
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      percent = maxScroll > 0 ? (currentScroll / maxScroll) : 0;

      // Identify active chapter based on offset
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i].offsetTop <= currentScroll + 200) {
          currentChapter = i + 1;
        }
      }
    }

    // Toggle active chapter class for dynamic entrance & depth animations
    chapters.forEach((sec, idx) => {
      sec.classList.toggle('chapter-active', idx === currentChapter - 1);
    });

    // Drive Hero Sequential Animation
    if (window.syncHeroAnimation) {
      window.syncHeroAnimation(percent);
    }

    // Update Header Active Nav Tab
    navLinks.forEach((link) => {
      const path = link.getAttribute('data-path');
      const targetIdx = navPathMap[path];
      if (targetIdx === currentChapter - 1) {
        link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold');
        link.classList.remove('text-on-surface-variant');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-semibold');
        link.classList.add('text-on-surface-variant');
        link.removeAttribute('aria-current');
      }
    });
  }

  // Scroll listeners
  track.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  updateScrollState();

  // CTA Exploration Helper
  window.scrollToNextChapter = () => {
    scrollToChapterIndex(1);
  };

  // FAQ Accordion Handler
  window.toggleFaq = (button) => {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.material-symbols-outlined');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);
    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  };

  /* ========================================================= */
  /* SELECTOR DE IDIOMAS Y GOOGLE TRANSLATE                   */
  /* ========================================================= */
  const langBtn = document.getElementById('lang-dropdown-btn');
  const langMenu = document.getElementById('lang-dropdown-menu');
  const langChevron = document.getElementById('lang-chevron');
  const currentFlag = document.getElementById('current-flag');
  const currentLangCode = document.getElementById('current-lang-code');
  const langOptions = document.querySelectorAll('.lang-option');

  const langMeta = {
    es: { flag: 'https://flagcdn.com/w80/es.png', code: 'ES', alt: 'Español' },
    ar: { flag: 'https://flagcdn.com/w80/sa.png', code: 'AR', alt: 'Árabe' },
    en: { flag: 'https://flagcdn.com/w80/gb.png', code: 'EN', alt: 'Inglés' },
    fr: { flag: 'https://flagcdn.com/w80/fr.png', code: 'FR', alt: 'Francés' },
    id: { flag: 'https://flagcdn.com/w80/id.png', code: 'ID', alt: 'Indonesio' },
    ur: { flag: 'https://flagcdn.com/w80/pk.png', code: 'UR', alt: 'Urdu' },
    tr: { flag: 'https://flagcdn.com/w80/tr.png', code: 'TR', alt: 'Turco' },
    bn: { flag: 'https://flagcdn.com/w80/bd.png', code: 'BN', alt: 'Bengalí' }
  };

  const currentFlagImg = document.getElementById('current-flag-img');

  function setLanguage(targetLang) {
    // Helper to write Google Translate cookie
    const hostname = window.location.hostname;
    const domainPart = hostname === 'localhost' || hostname === '127.0.0.1' ? '' : `domain=.${hostname};`;
    
    if (targetLang === 'es') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domainPart}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } else {
      document.cookie = `googtrans=/es/${targetLang}; path=/; ${domainPart}`;
      document.cookie = `googtrans=/es/${targetLang}; path=/;`;
    }

    // Update custom UI (Solo imagen de bandera)
    if (langMeta[targetLang] && currentFlagImg) {
      currentFlagImg.src = langMeta[targetLang].flag;
      currentFlagImg.alt = langMeta[targetLang].alt;
    }

    langOptions.forEach((opt) => {
      const isSelected = opt.getAttribute('data-lang') === targetLang;
      const dot = opt.querySelector('.lang-dot');
      if (dot) {
        dot.classList.toggle('hidden', !isSelected);
      }
      if (isSelected) {
        opt.classList.add('border-secondary/50', 'bg-surface-container-highest');
      } else {
        opt.classList.remove('border-secondary/50', 'bg-surface-container-highest');
      }
    });

    // Close menu
    if (langMenu) langMenu.classList.add('hidden');
    if (langBtn) langBtn.setAttribute('aria-expanded', 'false');

    // Trigger translate widget or reload smoothly
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  }

  // Toggle dropdown menu
  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = langMenu.classList.contains('hidden');
      if (isHidden) {
        langMenu.classList.remove('hidden');
        if (langChevron) langChevron.style.transform = 'rotate(180deg)';
        langBtn.setAttribute('aria-expanded', 'true');
      } else {
        langMenu.classList.add('hidden');
        if (langChevron) langChevron.style.transform = 'rotate(0deg)';
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) {
        langMenu.classList.add('hidden');
        if (langChevron) langChevron.style.transform = 'rotate(0deg)';
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Bind clicks to options
  langOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const selectedLang = opt.getAttribute('data-lang');
      if (selectedLang) {
        setLanguage(selectedLang);
      }
    });
  });

  // Read initial language from cookie if present
  const match = document.cookie.match(/googtrans=\/es\/([a-z]{2})/);
  if (match && match[1] && langMeta[match[1]]) {
    const saved = match[1];
    if (currentFlagImg) {
      currentFlagImg.src = langMeta[saved].flag;
      currentFlagImg.alt = langMeta[saved].alt;
    }
    langOptions.forEach((opt) => {
      const isSelected = opt.getAttribute('data-lang') === saved;
      const dot = opt.querySelector('.lang-dot');
      if (dot) dot.classList.toggle('hidden', !isSelected);
      if (isSelected) {
        opt.classList.add('border-secondary/50', 'bg-surface-container-highest');
      } else {
        opt.classList.remove('border-secondary/50', 'bg-surface-container-highest');
      }
    });
  }
});

// Global callback for Google Translate API
window.googleTranslateElementInit = function () {
  new window.google.translate.TranslateElement(
    {
      pageLanguage: 'es',
      includedLanguages: 'es,ar,en,fr,id,ur,tr,bn',
      autoDisplay: false,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
    },
    'google_translate_element'
  );
};


