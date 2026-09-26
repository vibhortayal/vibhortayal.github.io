// Subtle reveal-on-scroll for sections and project cards.
(function () {
  var els = document.querySelectorAll(
    ".hero > *, .project, .toy, .shelf-item, .log li, .principle, .collab-inner > *"
  );
  els.forEach(function (el) { el.classList.add("reveal"); });

  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();

// Hero stat links: jump to the section and expand the matching project rows.
(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") {
      try { window.umami.track(name, data); } catch (e) { /* analytics must never break the page */ }
    }
  }

  var STATS = {
    projects: { section: "#projects", match: function (d) { return d.closest("#projects"); } },
    live:     { section: "#projects", match: function (d) { return d.querySelector(".pill-live"); } },
    building: { section: "#projects", match: function (d) { return d.querySelector(".pill-building"); } },
    shelved:  { section: "#shelf",    match: function (d) { return d.closest("#shelf"); } }
  };

  document.querySelectorAll(".hero-stats a[data-stat]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var cfg = STATS[a.getAttribute("data-stat")];
      if (!cfg) return;
      e.preventDefault();
      document.querySelectorAll("details.shelf-item").forEach(function (d) {
        if (cfg.match(d)) d.open = true;
      });
      track("stat_click", { stat: a.getAttribute("data-stat") });
      var target = document.querySelector(cfg.section);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

// Umami custom events: which project rows get opened, which links get clicked.
(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") {
      try { window.umami.track(name, data); } catch (e) { /* analytics must never break the page */ }
    }
  }

  document.querySelectorAll("details.shelf-item").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      var t = d.querySelector(".shelf-summary-title");
      track("project_expand", { project: t ? t.textContent.trim() : "unknown" });
    });
  });

  document.querySelectorAll("a[href]").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return;
    a.addEventListener("click", function () {
      track("outbound_click", {
        label: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        url: href
      });
    });
  });
})();
