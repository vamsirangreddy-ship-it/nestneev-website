(function () {
  "use strict";

  /* Mobile nav toggle ----------------------------------------------------*/
  var toggle = document.querySelector(".nav__toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  /* Hero search widget -----------------------------------------------------*/
  var searchWidget = document.querySelector("[data-search-widget]");
  if (searchWidget) {
    var tabs = searchWidget.querySelectorAll("[data-tab]");
    var form = searchWidget.querySelector("form");
    var typeField = form ? form.querySelector('[name="purpose"]') : null;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        if (typeField) typeField.value = tab.getAttribute("data-tab");
        if (form) form.setAttribute("data-purpose", tab.getAttribute("data-tab"));
      });
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var purpose = form.getAttribute("data-purpose") || "buy";
        var params = new URLSearchParams();
        new FormData(form).forEach(function (value, key) {
          if (value) params.set(key, value);
        });
        if (purpose === "sell") {
          window.location.href = "/sell/";
          return;
        }
        window.location.href = "/" + purpose + "/?" + params.toString();
      });
    }
  }

  /* Listing filters (buy / rent pages) --------------------------------------*/
  var grid = document.querySelector("[data-listing-grid]");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".property-card"));
    var filterForm = document.querySelector("[data-filter-form]");
    var sortSelect = document.querySelector("[data-sort]");
    var countEl = document.querySelector("[data-results-count]");
    var emptyState = document.querySelector("[data-empty-state]");

    function readParams() {
      var p = new URLSearchParams(window.location.search);
      return {
        locality: p.get("locality") || "",
        type: p.get("type") || "",
        bhk: p.get("bhk") || "",
        minPrice: p.get("minPrice") || "",
        maxPrice: p.get("maxPrice") || "",
        possession: p.get("possession") || "",
        furnishing: p.get("furnishing") || "",
      };
    }

    function applyParamsToForm(params) {
      if (!filterForm) return;
      Object.keys(params).forEach(function (key) {
        var field = filterForm.querySelector('[name="' + key + '"]');
        if (field && params[key]) field.value = params[key];
      });
    }

    function currentFilters() {
      if (!filterForm) return {};
      var data = new FormData(filterForm);
      var out = {};
      data.forEach(function (value, key) { out[key] = value; });
      return out;
    }

    function matches(card, filters) {
      if (filters.locality && card.dataset.locality !== filters.locality) return false;
      if (filters.type && card.dataset.type !== filters.type) return false;
      if (filters.bhk && card.dataset.bhk !== filters.bhk) return false;
      if (filters.possession && card.dataset.possession !== filters.possession) return false;
      if (filters.furnishing && card.dataset.furnishing !== filters.furnishing) return false;
      var price = parseFloat(card.dataset.price || "0");
      if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
      return true;
    }

    function sortCards(list, sortBy) {
      var sorted = list.slice();
      if (sortBy === "price-asc") sorted.sort(function (a, b) { return (a.dataset.price - b.dataset.price); });
      else if (sortBy === "price-desc") sorted.sort(function (a, b) { return (b.dataset.price - a.dataset.price); });
      else if (sortBy === "area-desc") sorted.sort(function (a, b) { return (b.dataset.area - a.dataset.area); });
      else sorted.sort(function (a, b) { return new Date(b.dataset.posted) - new Date(a.dataset.posted); });
      return sorted;
    }

    function render() {
      var filters = currentFilters();
      var visible = 0;
      var sortBy = sortSelect ? sortSelect.value : "newest";
      var ordered = sortCards(cards, sortBy);
      ordered.forEach(function (card) {
        grid.appendChild(card);
        var show = matches(card, filters);
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (countEl) countEl.textContent = visible + (visible === 1 ? " property found" : " properties found");
      if (emptyState) emptyState.style.display = visible === 0 ? "block" : "none";
    }

    var initialParams = readParams();
    applyParamsToForm(initialParams);

    if (filterForm) {
      filterForm.addEventListener("input", render);
      filterForm.addEventListener("change", render);
      filterForm.addEventListener("reset", function () {
        setTimeout(render, 0);
      });
    }
    if (sortSelect) sortSelect.addEventListener("change", render);

    render();
  }

  /* Property gallery ---------------------------------------------------------*/
  var galleryMainImg = document.querySelector("[data-gallery-main] img");
  var thumbs = document.querySelectorAll("[data-gallery-thumb]");
  if (galleryMainImg && thumbs.length) {
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        galleryMainImg.setAttribute("src", thumb.getAttribute("src"));
        thumbs.forEach(function (t) { t.classList.remove("is-active"); });
        thumb.classList.add("is-active");
      });
    });
  }

  /* Featured carousel: enable drag-scroll with mouse (touch works natively) */
  document.querySelectorAll(".carousel, .locality-scroller").forEach(function (track) {
    var isDown = false, startX, scrollLeft;
    track.addEventListener("mousedown", function (e) {
      isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
    });
    ["mouseleave", "mouseup"].forEach(function (evt) {
      track.addEventListener(evt, function () { isDown = false; });
    });
    track.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  });

  /* Ajax-enhance forms that post to Netlify, so we can show inline success */
  document.querySelectorAll("form[data-ajax-form]").forEach(function (formEl) {
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(formEl);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString(),
      })
        .then(function () {
          formEl.style.display = "none";
          var success = formEl.parentElement.querySelector(".form-success");
          if (success) success.style.display = "block";
        })
        .catch(function () {
          window.location.href = formEl.getAttribute("action") || "/thank-you/";
        });
    });
  });
})();
