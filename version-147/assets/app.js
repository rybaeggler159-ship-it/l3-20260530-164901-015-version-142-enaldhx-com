(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isOpen = panel.hasAttribute('hidden');
      if (isOpen) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    var carousel = document.querySelector('.hero-carousel');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    if (!inputs.length) {
      return;
    }
    var query = new URLSearchParams(window.location.search).get('q') || '';
    inputs.forEach(function (input) {
      if (input.hasAttribute('data-query-sync') && query) {
        input.value = query;
      }
      var list = document.querySelector('[data-filter-list]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]')) : [];
      function applyFilter() {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' ').toLowerCase();
          card.classList.toggle('is-filtered-out', value && text.indexOf(value) === -1);
        });
      }
      input.addEventListener('input', applyFilter);
      applyFilter();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
}());
