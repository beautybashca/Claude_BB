/* ============================================================
   BEAUTY BASH — cms-data.js
   ============================================================
   PURPOSE: This file fixes the bug where CMS content saves
   correctly but never appears on the live pages.

   HOW IT WORKS:
   1. Decap CMS now saves content to JSON files in /data/
   2. This script fetches those JSON files via fetch()
   3. It renders the content into specific target elements
      in the HTML using innerHTML

   EACH RENDERER CHECKS FOR ITS TARGET ELEMENT FIRST.
   If the element doesn't exist on the current page,
   the renderer exits silently — no errors, no conflicts.

   LOAD ORDER: This script must be loaded AFTER main.js
   (it's added at the bottom of each HTML page).
   ============================================================ */


/* ----------------------------------------------------------
   UTILITY: Fetch a JSON file from /data/
   Returns parsed JSON or null if unavailable.
   The ?v= cache-bust ensures fresh data after CMS saves.
---------------------------------------------------------- */
async function bbFetch(path) {
  try {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.warn('[Beauty Bash CMS] Could not load', path, '—', err.message);
    return null;
  }
}

/* ----------------------------------------------------------
   UTILITY: Escape HTML to prevent XSS injection
   Applied to all CMS-supplied strings before innerHTML use.
---------------------------------------------------------- */
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ----------------------------------------------------------
   UTILITY: Convert plain text with \n\n paragraph breaks
   into proper HTML <p> tags (for service descriptions).
---------------------------------------------------------- */
function textToHtml(str) {
  if (!str) return '';
  return esc(str)
    .split('\n\n')
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}


/* ============================================================
   TESTIMONIALS CAROUSEL — homepage
   Target: <div id="bb-testimonials-carousel"> in index.html
   Source: /data/testimonials.json
   Behaviour: Fades between testimonials every 5 seconds.
              Dot indicators allow manual navigation.
   ============================================================ */
async function renderTestimonialsCarousel() {
  const el = document.getElementById('bb-testimonials-carousel');
  if (!el) return; // Not on homepage — exit silently

  const data = await bbFetch('/data/testimonials.json');

  // If no data yet, the static fallback in the HTML stays visible
  if (!data || !data.items || data.items.length === 0) return;

  const items = data.items;
  let current = 0;
  let timer;

  // Render all slides (only first is visible via CSS)
  el.innerHTML = `
    <div class="bb-carousel__slides">
      ${items.map((item, i) => `
        <div class="bb-carousel__slide ${i === 0 ? 'is-active' : ''}" aria-hidden="${i !== 0 ? 'true' : 'false'}">
          <span class="bb-testimonial-featured__mark">"</span>
          <p class="bb-testimonial-featured__text">${esc(item.quote)}</p>
          <p class="bb-testimonial-featured__attr">
            — <span>${esc(item.name)}</span>&nbsp;·&nbsp;${esc(item.service)}, ${esc(item.year)}
          </p>
        </div>
      `).join('')}
    </div>
    ${items.length > 1 ? `
      <div class="bb-carousel__dots" role="tablist" aria-label="Testimonials">
        ${items.map((_, i) => `
          <button
            class="bb-carousel__dot ${i === 0 ? 'is-active' : ''}"
            role="tab"
            aria-selected="${i === 0}"
            aria-label="Testimonial ${i + 1}"
            data-index="${i}"
          ></button>
        `).join('')}
      </div>
    ` : ''}
  `;

  function goTo(index) {
    const slides = el.querySelectorAll('.bb-carousel__slide');
    const dots   = el.querySelectorAll('.bb-carousel__dot');
    // Deactivate current
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    if (dots[current]) { dots[current].classList.remove('is-active'); dots[current].setAttribute('aria-selected','false'); }
    // Activate new
    current = (index + items.length) % items.length;
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    if (dots[current]) { dots[current].classList.add('is-active'); dots[current].setAttribute('aria-selected','true'); }
  }

  // Dot click handlers
  el.querySelectorAll('.bb-carousel__dot').forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(parseInt(dot.dataset.index, 10));
      startAuto();
    });
  });

  function startAuto() {
    if (items.length < 2) return;
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  startAuto();
}


/* ============================================================
   TESTIMONIALS LIST — testimonials.html
   Target: <div id="bb-testimonials-list"> in testimonials.html
   Source: /data/testimonials.json
   Behaviour: Renders all testimonials as cards in a grid.
   ============================================================ */
async function renderTestimonialsList() {
  const el = document.getElementById('bb-testimonials-list');
  if (!el) return;

  const data = await bbFetch('/data/testimonials.json');

  if (!data || !data.items || data.items.length === 0) {
    el.innerHTML = `
      <p style="text-align:center;color:var(--text-faint);padding:64px 0;letter-spacing:.06em;">
        Testimonials coming soon.
      </p>`;
    return;
  }

  el.innerHTML = `
    <div class="bb-testimonials-grid">
      ${data.items.map(item => `
        <div class="bb-testimonial-card">
          <p class="bb-testimonial-card__quote">"${esc(item.quote)}"</p>
          <p class="bb-testimonial-card__attr">
            — <span>${esc(item.name)}</span> · ${esc(item.service)}, ${esc(item.year)}
          </p>
        </div>
      `).join('')}
    </div>
  `;
}


/* ============================================================
   GALLERY PREVIEW — homepage (first 5 photos)
   Target: <div id="bb-gallery-preview-grid"> in index.html
   Source: /data/gallery.json
   Behaviour: Replaces placeholder cells with real photos.
              Lightbox opens on click (handled by main.js delegation).
   ============================================================ */
async function renderGalleryPreview() {
  const el = document.getElementById('bb-gallery-preview-grid');
  if (!el) return;

  const data = await bbFetch('/data/gallery.json');

  // No photos yet — leave the static placeholder HTML in place
  if (!data || !data.items || data.items.length === 0) return;

  const photos = data.items.slice(0, 5);
  // First cell is the tall one spanning both grid rows
  const tallClass = ['tall', '', '', '', ''];

  el.innerHTML = photos.map((photo, i) => `
    <div class="bb-gallery-preview__cell ${tallClass[i]}" data-lightbox>
      <img src="${esc(photo.image)}" alt="${esc(photo.alt)}" loading="lazy">
      <span class="bb-gallery-preview__label">${esc(photo.tag)}</span>
    </div>
  `).join('');

  // Update the "Showing N of M" count line
  const countEl = document.getElementById('bb-gallery-count');
  if (countEl) {
    countEl.textContent = `Showing ${Math.min(5, data.items.length)} of ${data.items.length} looks`;
  }
}


/* ============================================================
   GALLERY FULL GRID — gallery.html
   Target: <div id="bb-gallery-full-grid"> in gallery.html
   Source: /data/gallery.json
   Behaviour: Renders all photos. Tag label reveals on hover.
              Lightbox opens on click.
   ============================================================ */
async function renderGalleryFull() {
  const el = document.getElementById('bb-gallery-full-grid');
  if (!el) return;

  const data = await bbFetch('/data/gallery.json');

  if (!data || !data.items || data.items.length === 0) {
    el.innerHTML = `
      <p style="text-align:center;color:var(--text-faint);padding:64px 0;
                grid-column:1/-1;letter-spacing:.06em;">
        Gallery coming soon — photos will appear here after being added via the CMS.
      </p>`;
    return;
  }

  el.innerHTML = data.items.map(photo => `
    <div class="bb-gallery-full__cell" data-lightbox>
      <img src="${esc(photo.image)}" alt="${esc(photo.alt)}" loading="lazy">
      <div class="bb-gallery-full__overlay">
        <span class="bb-gallery-full__tag">${esc(photo.tag)}</span>
      </div>
    </div>
  `).join('');
}


/* ============================================================
   SERVICES ACCORDION — services.html
   Target: <div id="bb-services-accordion"> in services.html
   Source: /data/services.json
   Behaviour:
     - Each service renders as a clickable trigger row
     - Clicking expands a description panel (CSS max-height transition)
     - First item is open by default
     - Deep-link support: ?service=events auto-opens that item
   ============================================================ */
async function renderServicesAccordion() {
  const el = document.getElementById('bb-services-accordion');
  if (!el) return;

  const data = await bbFetch('/data/services.json');

  if (!data || !data.items || data.items.length === 0) {
    el.innerHTML = `
      <p style="text-align:center;color:var(--text-faint);padding:64px 0;letter-spacing:.06em;">
        Services coming soon — add them via the CMS.
      </p>`;
    return;
  }

  // Icon SVG paths keyed to the CMS "icon" field value
  const ICONS = {
    bridal:      '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>',
    events:      '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    photography: '<rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M3 17l4-4 3 3 4-5 4 6"/>',
    corporate:   '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>',
    maternity:   '<path d="M12 2a7 7 0 017 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 017-7zm0 9.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>'
  };

  el.innerHTML = data.items.map((service, i) => {
    const slug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const icon = ICONS[service.icon] || ICONS.bridal;
    return `
      <div class="bb-accordion__item" id="acc-${slug}" data-index="${i}">
        <button
          class="bb-accordion__trigger"
          aria-expanded="false"
          aria-controls="acc-panel-${i}"
          id="acc-trigger-${i}"
        >
          <span class="bb-accordion__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>
          </span>
          <span class="bb-accordion__title">${esc(service.title)}</span>
          <span class="bb-accordion__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </button>
        <div
          class="bb-accordion__panel"
          id="acc-panel-${i}"
          role="region"
          aria-labelledby="acc-trigger-${i}"
        >
          <div class="bb-accordion__content">
            ${service.image ? `
              <div class="bb-accordion__image">
                <img src="${esc(service.image)}" alt="${esc(service.title)}" loading="lazy">
              </div>` : ''}
            <div class="bb-accordion__text">
              ${textToHtml(service.description)}
            </div>
            <a href="contact.html" class="btn-outline">Book This Service</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Wire up accordion interaction
  function openItem(item) {
    const trigger = item.querySelector('.bb-accordion__trigger');
    const panel   = item.querySelector('.bb-accordion__panel');
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    // Set explicit max-height for animation (panel content height + buffer)
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  function closeItem(item) {
    const trigger = item.querySelector('.bb-accordion__trigger');
    const panel   = item.querySelector('.bb-accordion__panel');
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = '0';
  }

  el.querySelectorAll('.bb-accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', function () {
      const item   = this.closest('.bb-accordion__item');
      const isOpen = item.classList.contains('is-open');
      // Close all items
      el.querySelectorAll('.bb-accordion__item').forEach(closeItem);
      // Open clicked item only if it was previously closed
      if (!isOpen) openItem(item);
    });
  });

  // Open first item by default
  const firstItem = el.querySelector('.bb-accordion__item');
  if (firstItem) openItem(firstItem);

  // Deep-link support: services.html?service=events opens that item
  const params  = new URLSearchParams(window.location.search);
  const target  = params.get('service');
  if (target) {
    const targetEl = el.querySelector(`[id*="${target}"]`);
    if (targetEl) {
      el.querySelectorAll('.bb-accordion__item').forEach(closeItem);
      openItem(targetEl);
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}


/* ============================================================
   INIT — runs all renderers when the DOM is ready.
   Each renderer guards itself with an element-existence check
   so there are no errors on pages where that content doesn't live.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderTestimonialsCarousel();
  renderTestimonialsList();
  renderGalleryPreview();
  renderGalleryFull();
  renderServicesAccordion();
});
