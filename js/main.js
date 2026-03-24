/* ============================================================
   BEAUTY BASH — main.js
   Mobile navigation · Gallery lightbox · Smooth scroll

   CHANGE: Lightbox now uses event delegation on document
   instead of direct querySelectorAll listeners.
   WHY: gallery cells are rendered by cms-data.js AFTER
   DOMContentLoaded fires, so querySelectorAll('[data-lightbox]')
   would find 0 elements at setup time. Event delegation
   catches clicks on elements added at any point.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     MOBILE NAVIGATION
  ---------------------------------------------------------- */
  const nav    = document.getElementById('bb-nav');
  const toggle = document.getElementById('bb-nav-toggle');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('.bb-nav__links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINK
  ---------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bb-nav__links a').forEach(function (link) {
    if (link.getAttribute('href').split('/').pop() === currentPath) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     LIGHTBOX
     CHANGED: Was addEventListener on each [data-lightbox] cell
     found at page load. Now uses a single delegated listener
     on document so it catches dynamically rendered gallery cells.
  ---------------------------------------------------------- */
  const lightbox      = document.getElementById('bb-lightbox');
  const lightboxImg   = document.getElementById('bb-lightbox-img');
  const lightboxClose = document.getElementById('bb-lightbox-close');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    // Small delay before clearing src prevents flash
    setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 300);
  }

  // CHANGED: Single delegated listener — works for both
  // static and dynamically added [data-lightbox] cells
  document.addEventListener('click', function (e) {
    const cell = e.target.closest('[data-lightbox]');
    if (!cell) return;
    const img = cell.querySelector('img');
    if (img) openLightbox(img.src, img.alt);
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ----------------------------------------------------------
     NAV SHADOW ON SCROLL
  ---------------------------------------------------------- */
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 20
        ? '0 4px 40px rgba(18,8,32,0.4)'
        : 'none';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     CONTACT FORM — loading state
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('bb-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      const btn = this.querySelector('[type="submit"]');
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    });
  }

});
