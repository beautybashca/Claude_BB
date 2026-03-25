/* ============================================================
   BEAUTY BASH — theme-toggle.js
   ============================================================
   PURPOSE:
   Adds light/dark mode toggle behaviour. The toggle button
   (injected into the nav by this script) switches a
   "light-mode" class on <html>. CSS variables in style.css
   handle all visual changes — no JS colour logic.

   PERSISTENCE:
   The user's preference is saved to localStorage so it
   survives page reloads and navigation between pages.

   LOAD ORDER:
   Add this script tag to every HTML page, AFTER main.js:
     <script src="js/theme-toggle.js"></script>

   NO OTHER FILES NEED CHANGING — the toggle button is
   injected by this script so you only maintain it in
   one place.
   ============================================================ */

(function () {

  /* ----------------------------------------------------------
     1. READ SAVED PREFERENCE & APPLY IMMEDIATELY
     Runs before DOMContentLoaded to prevent a flash of the
     wrong theme on page load.
  ---------------------------------------------------------- */
  var savedTheme = localStorage.getItem('bb-theme');
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-mode');
  }

  /* ----------------------------------------------------------
     2. INJECT THE TOGGLE BUTTON INTO THE NAV
     Waits for DOM then finds the nav's CTA button and inserts
     the toggle immediately before it, so it always sits in the
     top-right corner alongside "Book Now".
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {

    var nav = document.getElementById('bb-nav');
    if (!nav) return;

    /* Create the button */
    var btn = document.createElement('button');
    btn.className    = 'bb-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle light/dark mode');
    btn.setAttribute('title', 'Toggle light/dark mode');

    /* SVG: moon icon (shown in dark mode — click to go light) */
    var moonSVG = '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">'
      + '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
      + '</svg>';

    /* SVG: sun icon (shown in light mode — click to go dark) */
    var sunSVG = '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">'
      + '<circle cx="12" cy="12" r="5"/>'
      + '<line x1="12" y1="1" x2="12" y2="3"/>'
      + '<line x1="12" y1="21" x2="12" y2="23"/>'
      + '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>'
      + '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>'
      + '<line x1="1" y1="12" x2="3" y2="12"/>'
      + '<line x1="21" y1="12" x2="23" y2="12"/>'
      + '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>'
      + '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      + '</svg>';

    btn.innerHTML = moonSVG + sunSVG;

    /* Insert before the "Book Now" CTA, or at end of nav if absent */
   var cta = nav.querySelector('.bb-nav__cta');
if (cta) {
  // FIXED: insert before cta using its actual parent (.bb-nav__menu),
  // not nav itself — the CTA is nested inside .bb-nav__menu, so
  // nav.insertBefore() threw a "not a child" error.
  cta.parentNode.insertBefore(btn, cta);
} else {
  nav.appendChild(btn);
}

    /* ----------------------------------------------------------
       3. TOGGLE HANDLER
       Flips the class, updates localStorage, and updates
       aria-label to reflect the current state.
    ---------------------------------------------------------- */
    btn.addEventListener('click', function () {
      var isLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('bb-theme', isLight ? 'light' : 'dark');
      btn.setAttribute('aria-label', isLight
        ? 'Switch to dark mode'
        : 'Switch to light mode'
      );
    });

    /* Set initial aria-label to match current theme */
    var isCurrentlyLight = document.documentElement.classList.contains('light-mode');
    btn.setAttribute('aria-label', isCurrentlyLight
      ? 'Switch to dark mode'
      : 'Switch to light mode'
    );

  });

}());
