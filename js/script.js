(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Live date in top bar
  --------------------------------------------------------- */
  var dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    var today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Mobile dropdown accordion behaviour
    var dropdownParents = mainNav.querySelectorAll('.has-dropdown > a');
    dropdownParents.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 860) {
          e.preventDefault();
          var parent = link.parentElement;
          var isOpen = parent.classList.toggle('open');
          link.setAttribute('aria-expanded', String(isOpen));
        }
      });
    });

    // Close mobile nav when a leaf link is clicked
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 860 && !link.parentElement.classList.contains('has-dropdown')) {
          mainNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------------------------------------------------------
     Search panel toggle
  --------------------------------------------------------- */
  var searchToggle = document.getElementById('searchToggle');
  var searchPanel = document.getElementById('searchPanel');
  var searchClose = document.getElementById('searchClose');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      var willOpen = !searchPanel.classList.contains('open');
      searchPanel.classList.toggle('open');
      searchToggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        var input = searchPanel.querySelector('input');
        if (input) setTimeout(function () { input.focus(); }, 200);
      }
    });
  }
  if (searchClose && searchPanel) {
    searchClose.addEventListener('click', function () {
      searchPanel.classList.remove('open');
      searchToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------------------------------------------------------
     Active nav link highlight on scroll
  --------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = document.querySelectorAll('.main-nav > ul > li > a');

  function highlightNav() {
    var scrollPos = window.scrollY + 140;
    var currentId = sections.length ? sections[0].id : null;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === '#' + currentId);
    });
  }

  /* ---------------------------------------------------------
     Sticky header shadow + back-to-top visibility (rAF throttled)
  --------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  var ticking = false;

  function onScroll() {
    if (header) header.style.boxShadow = window.scrollY > 8
      ? '0 6px 20px rgba(10,10,18,0.14)'
      : 'var(--shadow-sm)';

    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 480);

    highlightNav();
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Animated dashboard counters (trigger once, on view)
  --------------------------------------------------------- */
  var statValues = document.querySelectorAll('.stat-value');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('en-US');
      return;
    }
    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var value = Math.round(eased * target);
      el.textContent = value.toLocaleString('en-US');
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statValues.length) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statValues.forEach(function (el) { counterObserver.observe(el); });
  } else {
    statValues.forEach(animateCount);
  }

  /* ---------------------------------------------------------
     Language toggle (EN / FIL) — cosmetic state only
  --------------------------------------------------------- */
  var langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      langButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  /* ---------------------------------------------------------
     Reveal-on-scroll for cards
  --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('.service-card, .news-card, .official-card-lead, .official-mini');

  if ('IntersectionObserver' in window && revealTargets.length && !prefersReducedMotion) {
    revealTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 500ms ease, transform 500ms ease';
    });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

})();
