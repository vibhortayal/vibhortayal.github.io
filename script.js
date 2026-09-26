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

// Hero stat links: expand the relevant section(s), collapse the others,
// and open the matching project rows inside.
(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === "function") {
      try { window.umami.track(name, data); } catch (e) { /* analytics must never break the page */ }
    }
  }

  var CONTAINERS = ["collapse-projects", "collapse-toys", "collapse-shelf"];
  function isContainer(d) { return CONTAINERS.indexOf(d.id) !== -1; }

  var STATS = {
    projects: { sections: ["collapse-projects"], scrollTo: "#projects",
                match: function (d) { return !isContainer(d) && d.closest("#projects"); } },
    live:     { sections: ["collapse-projects", "collapse-toys"], scrollTo: "#projects",
                match: function (d) { return !isContainer(d) && d.querySelector(".pill-live"); } },
    building: { sections: ["collapse-projects"], scrollTo: "#projects",
                match: function (d) { return !isContainer(d) && d.querySelector(".pill-building"); } },
    shelved:  { sections: ["collapse-shelf"], scrollTo: "#shelf",
                match: function (d) { return !isContainer(d) && d.closest("#shelf"); } }
  };

  document.querySelectorAll(".hero-stats a[data-stat]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var cfg = STATS[a.getAttribute("data-stat")];
      if (!cfg) return;
      e.preventDefault();
      CONTAINERS.forEach(function (id) { document.getElementById(id).open = false; });
      document.querySelectorAll("details.shelf-item, details.section-collapse").forEach(function (d) {
        if (!isContainer(d)) d.open = false;
      });
      cfg.sections.forEach(function (id) { document.getElementById(id).open = true; });
      document.querySelectorAll("details.shelf-item").forEach(function (d) {
        if (cfg.match(d)) d.open = true;
      });
      track("stat_click", { stat: a.getAttribute("data-stat") });
      var target = document.querySelector(cfg.scrollTo);
      if (target) {
        var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  // In-page nav links should land on an open section, not a collapsed one.
  document.querySelectorAll('a[href="#projects"], a[href="#shelf"]').forEach(function (a) {
    if (a.hasAttribute("data-stat")) return;
    a.addEventListener("click", function () {
      var c = document.getElementById(a.getAttribute("href") === "#projects" ? "collapse-projects" : "collapse-shelf");
      if (c) c.open = true;
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
