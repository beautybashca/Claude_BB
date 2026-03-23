/* ============================================================
   BEAUTY BASH — main.js
   Mobile navigation · Gallery lightbox · Smooth scroll
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
      const isOpen = nav.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    nav.querySelectorAll('.bb-nav__links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINK — highlights current page
  ---------------------------------------------------------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bb-nav__links a').forEach(function (link) {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     LIGHTBOX — for gallery images
  ---------------------------------------------------------- */
  const lightbox    = document.getElementById('bb-lightbox');
  const lightboxImg = document.getElementById('bb-lightbox-img');
  const lightboxClose = document.getElementById('bb-lightbox-close');

  if (lightbox && lightboxImg) {

    // Open on gallery cell click
    document.querySelectorAll('[data-lightbox]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        const src = this.querySelector('img') ? this.querySelector('img').src : null;
        const alt = this.querySelector('img') ? this.querySelector('img').alt : '';
        if (src) {
          lightboxImg.src = src;
          lightboxImg.alt = alt;
          lightbox.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    // Close on button click
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }
  }

  /* ----------------------------------------------------------
     NAV SHADOW on scroll
  ---------------------------------------------------------- */
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.style.boxShadow = '0 4px 40px rgba(18,8,32,0.4)';
      } else {
        nav.style.boxShadow = 'none';
      }
    });
  }

  /* ----------------------------------------------------------
     CONTACT FORM — client-side enhancement
     Netlify handles the actual submission
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('bb-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      const btn = this.querySelector('[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
      }
    });
  }

});
