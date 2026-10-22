/**
 * Nandhini P — Portfolio Script
 * Vanilla JS only. No libraries. No build step.
 *
 * Contents:
 *  1. Dark / Light theme toggle
 *  2. Sticky navbar (scroll shadow + active link tracking)
 *  3. Hamburger / mobile nav
 *  4. Scroll-reveal animation (IntersectionObserver)
 *  5. Back-to-top button
 *  6. Smooth-scroll for nav links (closes mobile menu)
 *  7. Footer year auto-update
 */

'use strict';

/* ================================================================
   HELPERS
================================================================ */

/**
 * Shorthand for document.querySelector
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand for document.querySelectorAll → Array
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ================================================================
   1. DARK / LIGHT THEME TOGGLE
================================================================ */

const THEME_KEY = 'np-portfolio-theme';

/**
 * Applies the given theme to the <html> element and updates the
 * toggle button icon.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = qs('#themeIcon');
  if (icon) {
    // Sun = dark mode (click to switch to light), Moon = light mode
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_) { /* localStorage may be blocked in private browsing */ }
}

/**
 * Returns the user's saved or preferred theme.
 * Priority: localStorage → OS preference → default 'dark'
 * @returns {'dark'|'light'}
 */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) { /* ignore */ }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function initTheme() {
  const initial = getInitialTheme();
  applyTheme(initial);

  const toggleBtn = qs('#themeToggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}


/* ================================================================
   2. STICKY NAVBAR — scroll shadow + active section highlighting
================================================================ */

function initNavbar() {
  const navbar  = qs('#navbar');
  const navLinks = qsa('.nav-links a');
  const sections = qsa('main section[id]');

  if (!navbar) return;

  // Add scrolled class when user has scrolled past 10px
  function onScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveSection();
  }

  // Mark the nav link whose section is currently in viewport
  function highlightActiveSection() {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      // Consider a section "active" when its top is within 0–80% of viewport
      if (top <= window.innerHeight * 0.4 && top + section.offsetHeight > 0) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ================================================================
   3. HAMBURGER MENU (MOBILE)
================================================================ */

function initHamburger() {
  const hamburger = qs('#hamburger');
  const mobileNav = qs('#mobileNav');
  if (!hamburger || !mobileNav) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileNav.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu when a link inside it is clicked
  qsa('.mobile-nav-link', mobileNav).forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close menu when clicking outside it
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      toggleMenu(false);
    }
  });
}


/* ================================================================
   4. SCROLL-REVEAL (IntersectionObserver)
================================================================ */

function initScrollReveal() {
  const revealEls = qsa('.reveal');
  if (!revealEls.length) return;

  // If the browser doesn't support IntersectionObserver, just show everything
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after reveal — no need to re-animate
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,        // viewport
      threshold: 0.12,   // trigger when 12% visible
      rootMargin: '0px 0px -40px 0px', // small bottom offset
    }
  );

  revealEls.forEach(el => observer.observe(el));
}


/* ================================================================
   5. BACK-TO-TOP BUTTON
================================================================ */

function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  function onScroll() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ================================================================
   6. SMOOTH SCROLL + MOBILE MENU CLOSE for anchor links
================================================================ */

function initSmoothScroll() {
  // Apply to all internal anchor links across the page
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = qs(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      // Offset for fixed navbar height
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'),
        10
      ) || 64;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}


/* ================================================================
   7. FOOTER — AUTO-UPDATE YEAR
================================================================ */

function initFooterYear() {
  const el = qs('#currentYear');
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}


/* ================================================================
   8. CURSOR SPARKLE EFFECT (subtle, optional)
   Tiny green dot trail on mouse move — lightweight, no canvas.
================================================================ */

function initCursorSparkle() {
  // Only on non-touch, non-reduced-motion devices
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch        = window.matchMedia('(pointer: coarse)').matches;
  if (prefersReduced || isTouch) return;

  let tick = 0;

  document.addEventListener('mousemove', (e) => {
    tick++;
    // Throttle: only every 3rd event
    if (tick % 3 !== 0) return;

    const dot = document.createElement('span');
    dot.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 6px;
      height: 6px;
      background: #39ff14;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.7;
      transform: translate(-50%, -50%) scale(1);
      transition: opacity 0.5s ease, transform 0.5s ease;
    `;

    document.body.appendChild(dot);

    // Trigger fade + shrink on next frame
    requestAnimationFrame(() => {
      dot.style.opacity = '0';
      dot.style.transform = 'translate(-50%, -50%) scale(0)';
    });

    // Remove from DOM after animation
    setTimeout(() => dot.remove(), 520);
  });
}


/* ================================================================
   9. TYPED TEXT EFFECT in hero tagline (subtle word cycle)
   Swaps the last word of the tagline through a set of descriptors.
================================================================ */

function initTypedTagline() {
  const el = qs('.hero-tagline');
  if (!el) return;

  const words   = ['clean, usable products', 'great developer UX', 'real-world impact', 'meaningful solutions'];
  let idx       = 0;
  const accentEl = el.querySelector('.accent');
  if (!accentEl) return;

  // Don't run if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  setInterval(() => {
    idx = (idx + 1) % words.length;
    // Quick fade out → update → fade in
    accentEl.style.transition = 'opacity 0.35s ease';
    accentEl.style.opacity    = '0';

    setTimeout(() => {
      accentEl.textContent  = words[idx];
      accentEl.style.opacity = '1';
    }, 380);
  }, 3200);
}


/* ================================================================
   INIT — run everything once DOM is ready
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initHamburger();
  initScrollReveal();
  initBackToTop();
  initSmoothScroll();
  initFooterYear();
  initCursorSparkle();
  initTypedTagline();
});
