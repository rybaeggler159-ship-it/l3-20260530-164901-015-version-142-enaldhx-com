(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterRegion = document.querySelector("[data-filter-region]");
  var filterYear = document.querySelector("[data-filter-year]");
  var filterType = document.querySelector("[data-filter-type]");
  var filterCategory = document.querySelector("[data-filter-category]");
  var cards = Array.prototype.slice.call(
    document.querySelectorAll("[data-movie-card]"),
  );
  var noResult = document.querySelector("[data-no-result]");

  function readValue(node) {
    return node ? node.value.trim().toLowerCase() : "";
  }

  function applyQueryFromUrl() {
    if (!filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      filterInput.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = readValue(filterInput);
    var region = readValue(filterRegion);
    var year = readValue(filterYear);
    var type = readValue(filterType);
    var category = readValue(filterCategory);
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-tags") || "",
      ]
        .join(" ")
        .toLowerCase();

      var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchesRegion =
        !region ||
        (card.getAttribute("data-region") || "")
          .toLowerCase()
          .indexOf(region) !== -1;
      var matchesYear =
        !year ||
        (card.getAttribute("data-year") || "").toLowerCase().indexOf(year) !==
          -1;
      var matchesType =
        !type ||
        (card.getAttribute("data-type") || "").toLowerCase().indexOf(type) !==
          -1;
      var matchesCategory =
        !category ||
        (card.getAttribute("data-category") || "").toLowerCase() === category;
      var ok =
        matchesKeyword &&
        matchesRegion &&
        matchesYear &&
        matchesType &&
        matchesCategory;

      card.style.display = ok ? "" : "none";

      if (ok) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle("is-visible", visible === 0);
    }
  }

  [filterInput, filterRegion, filterYear, filterType, filterCategory].forEach(
    function (node) {
      if (node) {
        node.addEventListener("input", filterCards);
        node.addEventListener("change", filterCards);
      }
    },
  );

  applyQueryFromUrl();
  filterCards();
})();
