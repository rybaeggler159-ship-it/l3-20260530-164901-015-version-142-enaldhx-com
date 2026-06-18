(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!input || !cards.length) {
      return;
    }
    function applySearch() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
        card.classList.toggle("hidden", value && text.indexOf(value) === -1);
      });
    }
    input.addEventListener("input", applySearch);
  }

  function initFilters() {
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!chips.length || !cards.length) {
      return;
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filter = (chip.getAttribute("data-filter") || "all").toLowerCase();
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
          card.classList.toggle("hidden", filter !== "all" && text.indexOf(filter) === -1);
        });
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    var status = document.querySelector(".player-status");
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;
    var hls = null;
    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }
    function attach() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      setStatus("正在打开影片");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放暂不可用");
            }
          });
        });
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      setStatus("播放暂不可用");
      return Promise.resolve();
    }
    function play() {
      attach().then(function () {
        overlay.classList.add("is-hidden");
        video.controls = true;
        var request = video.play();
        if (request && request.catch) {
          request.catch(function () {
            overlay.classList.remove("is-hidden");
            setStatus("点击继续播放");
          });
        }
      });
    }
    overlay.addEventListener("click", play);
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
  });
})();
