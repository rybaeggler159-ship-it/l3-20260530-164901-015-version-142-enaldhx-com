(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-nav]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var index = 0;
    var timer;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });
    show(0);
    play();
  }

  function setupFilters() {
    var root = document.querySelector('[data-filter-root]');
    if (!root) {
      return;
    }
    var cards = all('[data-card]', root);
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && input) {
      input.value = initialQuery;
    }
    function valueOf(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }
    function apply() {
      var query = valueOf(input);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && String(card.dataset.region || '').toLowerCase() !== regionValue) {
          matched = false;
        }
        if (typeValue && String(card.dataset.type || '').toLowerCase() !== typeValue) {
          matched = false;
        }
        if (yearValue && String(card.dataset.year || '').toLowerCase() !== yearValue) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [input, region, type, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('videoOverlay');
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var started = false;
    var hlsInstance = null;
    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function start() {
      if (!started) {
        started = true;
        attach();
      }
      overlay.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
