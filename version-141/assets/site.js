
(function () {
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const $ = (selector, root = document) => root.querySelector(selector);

  function currentPrefix() {
    return location.pathname.includes('/video/') || location.pathname.includes('/category/') ? '../' : '';
  }

  function setupMobileMenu() {
    const button = $('.mobile-toggle');
    const nav = $('.mobile-nav');
    if (!button || !nav) return;
    button.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  function setupHero() {
    const slides = $$('.hero-slide');
    const thumbs = $$('.hero-thumb');
    if (!slides.length) return;
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
    };
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        show(i);
        if (timer) clearInterval(timer);
        timer = setInterval(() => show(index + 1), 5200);
      });
    });
    timer = setInterval(() => show(index + 1), 5200);
  }

  function setupSearch() {
    const inputs = $$('.site-search-input');
    if (!inputs.length || !window.MOVIE_INDEX) return;
    const prefix = currentPrefix();
    inputs.forEach((input) => {
      const panel = input.parentElement.querySelector('.search-panel');
      if (!panel) return;
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        const results = window.MOVIE_INDEX.filter((movie) => {
          const hay = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.oneLine].join(' ').toLowerCase();
          return hay.includes(q);
        }).slice(0, 12);
        panel.innerHTML = results.length
          ? results.map((movie) => `
            <a class="search-item" href="${prefix}${movie.url}">
              <img src="${prefix}${movie.image}" alt="${movie.title}" loading="lazy">
              <span>
                <strong>${movie.title}</strong>
                <span>${movie.region} · ${movie.year} · ${movie.category}</span>
              </span>
            </a>
          `).join('')
          : '<div class="search-item"><span><strong>未找到影片</strong><span>换个关键词试试</span></span></div>';
        panel.classList.add('is-open');
      });
      document.addEventListener('click', (event) => {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove('is-open');
        }
      });
    });
  }

  function setupCategoryFilter() {
    const list = $('.category-list');
    if (!list) return;
    const input = $('.category-filter-input');
    const buttons = $$('[data-filter-year]');
    let year = 'all';
    const apply = () => {
      const q = input ? input.value.trim().toLowerCase() : '';
      $$('.movie-card', list).forEach((card) => {
        const okYear = year === 'all' || card.dataset.year === year;
        const hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        const okText = !q || hay.includes(q);
        card.style.display = okYear && okText ? '' : 'none';
      });
    };
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        button.classList.add('is-active');
        year = button.dataset.filterYear;
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
  }

  function setupPlayer() {
    const video = $('#main-player');
    const start = $('.player-start');
    if (!video) return;
    const src = video.dataset.src;
    const load = () => {
      if (!src) return;
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    };
    load();
    if (start) {
      start.addEventListener('click', () => {
        start.classList.add('is-hidden');
        video.play().catch(() => {
          start.classList.remove('is-hidden');
        });
      });
      video.addEventListener('play', () => start.classList.add('is-hidden'));
    }
  }

  setupMobileMenu();
  setupHero();
  setupSearch();
  setupCategoryFilter();
  setupPlayer();
})();
