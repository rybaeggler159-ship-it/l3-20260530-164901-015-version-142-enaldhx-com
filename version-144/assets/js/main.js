(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getText(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var parent = scope.parentElement || document;
      var list = parent.querySelector('[data-filter-list]') || document.querySelector('[data-filter-list]');
      if (!list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var input = scope.querySelector('[data-filter-input]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var empty = list.querySelector('[data-empty-state]');

      function apply() {
        var q = getText(input && input.value);
        var r = getText(region && region.value);
        var t = getText(type && type.value);
        var y = getText(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) ok = false;
          if (r && getText(card.getAttribute('data-region')) !== r) ok = false;
          if (t && getText(card.getAttribute('data-type')) !== t) ok = false;
          if (y && getText(card.getAttribute('data-year')) !== y) ok = false;
          card.hidden = !ok;
          if (ok) visible += 1;
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (el) {
        if (el) el.addEventListener('input', apply);
        if (el && el.tagName === 'SELECT') el.addEventListener('change', apply);
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
