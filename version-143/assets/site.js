(function () {
  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function initHero() {
    var slides = toArray(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var dots = toArray(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function createResultItem(movie) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = movie.url;

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = 'lazy';

    var text = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    var meta = document.createElement('span');
    meta.textContent = [movie.year, movie.region, movie.type, movie.category].filter(Boolean).join(' · ');

    text.appendChild(title);
    text.appendChild(meta);
    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  function initGlobalSearch() {
    var inputs = toArray(document.querySelectorAll('.global-search'));
    var movies = window.SEARCH_MOVIES || [];
    if (!inputs.length || !movies.length) {
      return;
    }

    inputs.forEach(function (input) {
      var wrap = input.parentElement;
      var box = wrap ? wrap.querySelector('.search-results') : null;
      if (!box) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        box.innerHTML = '';
        if (!keyword) {
          box.hidden = true;
          return;
        }
        var matches = movies.filter(function (movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          var empty = document.createElement('div');
          empty.className = 'search-result-item';
          empty.textContent = '暂无匹配影片';
          box.appendChild(empty);
          box.hidden = false;
          return;
        }

        matches.forEach(function (movie) {
          box.appendChild(createResultItem(movie));
        });
        box.hidden = false;
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') {
          return;
        }
        var first = box.querySelector('a');
        if (first) {
          window.location.href = first.href;
        }
      });

      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
          box.hidden = true;
        }
      });
    });
  }

  function initLocalFilters() {
    var scopes = toArray(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var root = scope.parentElement || document;
      var grid = root.querySelector('[data-card-grid]');
      if (!grid) {
        grid = document.querySelector('[data-card-grid]');
      }
      if (!grid) {
        return;
      }

      var cards = toArray(grid.children);
      var keywordInput = scope.querySelector('[data-local-search]');
      var typeButtons = toArray(scope.querySelectorAll('[data-filter-type]'));
      var yearButtons = toArray(scope.querySelectorAll('[data-filter-year]'));
      var activeType = 'all';
      var activeYear = 'all';

      function apply() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = activeType === 'all' || card.getAttribute('data-type') === activeType;
          var matchYear = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
          card.classList.toggle('is-hidden-card', !(matchKeyword && matchType && matchYear));
        });
      }

      if (keywordInput) {
        keywordInput.addEventListener('input', apply);
      }

      typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeType = button.getAttribute('data-filter-type') || 'all';
          typeButtons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });

      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeYear = button.getAttribute('data-filter-year') || 'all';
          yearButtons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          apply();
        });
      });
    });
  }

  function setupPlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.querySelector(options.buttonSelector);
    var loaded = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(options.streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = options.streamUrl;
      }
    }

    function play() {
      load();
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      button.classList.remove('is-hidden');
    });

    return {
      load: load,
      play: play,
      destroy: function () {
        if (hls) {
          hls.destroy();
        }
      }
    };
  }

  window.MovieRank = {
    setupPlayer: setupPlayer
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilters();
  });
})();
