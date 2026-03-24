/* ============================================================
   BEAUTY BASH — cms-data.js
   ============================================================
   CHANGES IN THIS VERSION:
   - renderTestimonialsCarousel: now renders item.location
     beneath the attribution line when present
   - renderTestimonialsList: same — location rendered beneath
     the attr line in each card
   - Email updated: info@beautybash.ca (was hello@)
   All other renderers (gallery, services) are unchanged.
   ============================================================ */


/* ----------------------------------------------------------
   UTILITY: Fetch a JSON file from /data/
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
   UTILITY: Escape HTML
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
   UTILITY: Plain text → HTML paragraphs
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
   Target:  #bb-testimonials-carousel  (index.html)
   Source:  /data/testimonials.json

   CHANGED: Each slide now conditionally renders a location line.
   If item.location is present the .bb-testimonial-featured__location
   element appears beneath the attribution; if absent nothing renders.
   ============================================================ */
async function renderTestimonialsCarousel() {
  const el = document.getElementById('bb-testimonials-carousel');
  if (!el) return;

  const data = await bbFetch('/data/testimonials.json');
  if (!data || !data.items || data.items.length === 0) return;

  const items = data.items;
  let current = 0;
  let timer;

  el.innerHTML = `
    <div class="bb-carousel__slides">
      ${items.map((item, i) => `
        <div class="bb-carousel__slide ${i === 0 ? 'is-active' : ''}"
             aria-hidden="${i !== 0 ? 'true' : 'false'}">
          <span class="bb-testimonial-featured__mark">"</span>
          <p class="bb-testimonial-featured__text">${esc(item.quote)}</p>
          <p class="bb-testimonial-featured__attr">
            — <span>${esc(item.name)}</span>&nbsp;·&nbsp;${esc(item.service)}, ${esc(item.year)}
          </p>
          ${item.location
            /* ADDED: location line — only rendered when field has a value.
               The conditional prevents an empty element appearing for
               testimonials where location was left blank in the CMS. */
            ? `<p class="bb-testimonial-featured__location">${esc(item.location)}</p>`
            : ''}
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
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    if (dots[current]) { dots[current].classList.remove('is-active'); dots[current].setAttribute('aria-selected','false'); }
    current = (index + items.length) % items.length;
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    if (dots[current]) { dots[current].classList.add('is-active'); dots[current].setAttribute('aria-selected','true'); }
  }

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
   Target:  #bb-testimonials-list  (testimonials.html)
   Source:  /data/testimonials.json

   CHANGED: Location rendered beneath .bb-testimonial-card__attr
   when present, using the same conditional pattern as the carousel.
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
          ${item.location
            /* ADDED: same conditional location line as carousel.
               Sits beneath the name/service attribution in each card. */
            ? `<p class="bb-testimonial-card__location">${esc(item.location)}</p>`
            : ''}
        </div>
      `).join('')}
    </div>
  `;
}


/* ============================================================
   GALLERY PREVIEW — homepage (unchanged)
   ============================================================ */
async function renderGalleryPreview() {
  const el = document.getElementById('bb-gallery-preview-grid');
  if (!el) return;

  const data = await bbFetch('/data/gallery.json');
  if (!data || !data.items || data.items.length === 0) return;

  const photos = data.items.slice(0, 5);
  const tallClass = ['tall', '', '', '', ''];

  el.innerHTML = photos.map((photo, i) => `
    <div class="bb-gallery-preview__cell ${tallClass[i]}" data-lightbox>
      <img src="${esc(photo.image)}" alt="${esc(photo.alt)}" loading="lazy">
      <span class="bb-gallery-preview__label">${esc(photo.tag)}</span>
    </div>
  `).join('');

  const countEl = document.getElementById('bb-gallery-count');
  if (countEl) countEl.textContent = `Showing ${Math.min(5, data.items.length)} of ${data.items.length} looks`;
}


/* ============================================================
   GALLERY FULL GRID — gallery.html (unchanged)
   ============================================================ */
async function renderGalleryFull() {
  const el = document.getElementById('bb-gallery-full-grid');
  if (!el) return;

  const data = await bbFetch('/data/gallery.json');

  if (!data || !data.items || data.items.length === 0) {
    el.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;color:var(--text-faint);padding:64px 0;letter-spacing:.06em;">
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
   SERVICES ACCORDION — services.html (unchanged)
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
        <button class="bb-accordion__trigger" aria-expanded="false"
                aria-controls="acc-panel-${i}" id="acc-trigger-${i}">
          <span class="bb-accordion__icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg>
          </span>
          <span class="bb-accordion__title">${esc(service.title)}</span>
          <span class="bb-accordion__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </button>
        <div class="bb-accordion__panel" id="acc-panel-${i}"
             role="region" aria-labelledby="acc-trigger-${i}">
          <div class="bb-accordion__content">
            ${service.image ? `
              <div class="bb-accordion__image">
                <img src="${esc(service.image)}" alt="${esc(service.title)}" loading="lazy">
              </div>` : ''}
            <div class="bb-accordion__text">${textToHtml(service.description)}</div>
            <a href="contact.html" class="btn-outline">Book This Service</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  function openItem(item) {
    const trigger = item.querySelector('.bb-accordion__trigger');
    const panel   = item.querySelector('.bb-accordion__panel');
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
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
      el.querySelectorAll('.bb-accordion__item').forEach(closeItem);
      if (!isOpen) openItem(item);
    });
  });

  const firstItem = el.querySelector('.bb-accordion__item');
  if (firstItem) openItem(firstItem);

  const params   = new URLSearchParams(window.location.search);
  const target   = params.get('service');
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
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderTestimonialsCarousel();
  renderTestimonialsList();
  renderGalleryPreview();
  renderGalleryFull();
  renderServicesAccordion();
});
