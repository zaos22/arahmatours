/**
 * Arahma Tours - One Take Experience Engine
 * Implements smooth horizontal journey, navigation syncing, keyboard support and interactive elements.
 */
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('horizontal-track');
  if (!track) return;

  const chapters = Array.from(track.querySelectorAll('section'));
  const totalChapters = chapters.length;

  // Header Nav Links & Progress controls
  const navLinks = document.querySelectorAll('header nav a[data-path]');
  const prevBtn = document.getElementById('prev-chapter-btn');
  const nextBtn = document.getElementById('next-chapter-btn');
  const progressBar = document.getElementById('progress-bar-fill');
  const planeIndicator = document.getElementById('progress-plane-indicator');
  const chapterLabel = document.getElementById('chapter-indicator-label');
  const chapterDots = document.querySelectorAll('.chapter-dot');

  // Map route names to chapter indices (0-based)
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

  // Helper to scroll to specific chapter
  function scrollToChapterIndex(index) {
    if (index < 0) index = 0;
    if (index >= totalChapters) index = totalChapters - 1;
    const targetSection = chapters[index];
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  // Helper to determine if horizontal mode is active (PC / landscape)
  function isHorizontalMode() {
    return window.innerWidth > 1024 && window.matchMedia('(orientation: landscape)').matches;
  }

  // Convert mouse wheel vertically into horizontal slide ONLY in horizontal mode (PC)
  track.addEventListener('wheel', (e) => {
    if (!isHorizontalMode()) return; // Allow natural vertical wheel scroll in mobile / tall screens

    if (e.deltaY !== 0) {
      e.preventDefault();
      track.scrollBy({
        left: e.deltaY * 1.5,
        behavior: 'auto'
      });
    }
  }, { passive: false });

  // Keyboard navigation (only in horizontal PC mode)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!isHorizontalMode()) return;

    if (e.key === 'ArrowRight') {
      track.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      track.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  });

  // Prev / Next Floating Controls
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

  // Update Bottom Controls and Header on Scroll
  function updateScrollState() {
    if (!isHorizontalMode()) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    const currentScroll = track.scrollLeft;
    const percent = maxScroll > 0 ? Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100)) : 0;
    const chapterIndex = Math.min(totalChapters, Math.max(1, Math.round((currentScroll / window.innerWidth) + 1)));

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (planeIndicator) planeIndicator.style.left = `${percent}%`;
    if (chapterLabel) chapterLabel.textContent = `Capítulo 0${chapterIndex} / 0${totalChapters}`;

    // Highlight active chapter dots
    chapterDots.forEach((dot, idx) => {
      if (idx + 1 === chapterIndex) {
        dot.classList.add('text-secondary', 'font-bold');
        dot.classList.remove('text-on-surface-variant');
      } else {
        dot.classList.remove('text-secondary', 'font-bold');
        dot.classList.add('text-on-surface-variant');
      }
    });

    // Update active nav button state
    navLinks.forEach((link) => {
      const path = link.getAttribute('data-path');
      const targetIdx = navPathMap[path];
      if (targetIdx === chapterIndex - 1) {
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

  track.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  updateScrollState();

  // Global helper for CTA buttons
  window.scrollToNextChapter = () => {
    if (isHorizontalMode()) {
      track.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    } else {
      const secondChapter = chapters[1];
      if (secondChapter) secondChapter.scrollIntoView({ behavior: 'smooth' });
    }
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
});
