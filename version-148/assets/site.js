(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var noResults = document.querySelector(".no-results");
    if (!input && !typeFilter && !yearFilter) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (input && initialQuery) {
      input.value = initialQuery;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var selectedType = typeFilter ? typeFilter.value : "";
      var selectedYear = yearFilter ? yearFilter.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedType && type !== selectedType) {
          matched = false;
        }
        if (selectedYear && year !== selectedYear) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", apply);
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });

  window.initPlayer = function (videoId, buttonId, layerId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var layer = document.getElementById(layerId);
    if (!video || !source) {
      return;
    }
    var hlsInstance = null;
    var started = false;

    function setMessage(message) {
      if (layer) {
        layer.innerHTML = '<div class="player-message">' + message + '</div>';
      }
    }

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (layer) {
        layer.classList.add("is-hidden");
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setMessage("播放暂不可用，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      } else {
        setMessage("播放暂不可用，请稍后重试");
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (layer) {
      layer.addEventListener("click", start);
      layer.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
