(function () {
  var mq = window.matchMedia("(max-width: 968px)");

  function setTriggersAria() {
    document.querySelectorAll(".nav-mega").forEach(function (mega) {
      var t = mega.querySelector(".nav-mega-trigger");
      if (!t) return;
      if (mq.matches) {
        t.setAttribute(
          "aria-expanded",
          mega.classList.contains("nav-mega-open") ? "true" : "false",
        );
      } else {
        t.removeAttribute("aria-expanded");
      }
    });
  }

  document.querySelectorAll(".nav-mega-trigger").forEach(function (trig) {
    if (trig.dataset.navMegaAccordion) return;
    trig.dataset.navMegaAccordion = "1";
    trig.setAttribute("aria-haspopup", "true");
    trig.addEventListener("click", function (e) {
      if (!mq.matches) return;
      e.preventDefault();
      var mega = trig.closest(".nav-mega");
      if (!mega) return;
      var willOpen = !mega.classList.contains("nav-mega-open");
      document.querySelectorAll(".nav-mega").forEach(function (m) {
        m.classList.remove("nav-mega-open");
      });
      if (willOpen) mega.classList.add("nav-mega-open");
      setTriggersAria();
    });
  });

  mq.addEventListener("change", setTriggersAria);

  var navbar = document.getElementById("navbar");
  if (navbar && typeof MutationObserver !== "undefined") {
    new MutationObserver(function () {
      if (!navbar.classList.contains("nav-open")) {
        document.querySelectorAll(".nav-mega.nav-mega-open").forEach(function (m) {
          m.classList.remove("nav-mega-open");
        });
        setTriggersAria();
      }
    }).observe(navbar, { attributes: true, attributeFilter: ["class"] });
  }

  function syncNavbarScrolled() {
    if (!navbar) return;
    var compact = window.scrollY > 60;
    navbar.classList.toggle("scrolled", compact);
    document.body.classList.toggle("nav-logo-compact", compact);
  }
  syncNavbarScrolled();
  window.addEventListener("scroll", syncNavbarScrolled, { passive: true });

  function scrollToHash(hash, behavior) {
    if (!hash || hash === "#") return;
    var id = hash.charAt(0) === "#" ? hash.slice(1) : hash;
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({
      behavior: behavior || "smooth",
      block: "start",
    });
  }

  function isIndexPage() {
    var path = window.location.pathname.replace(/\/$/, "");
    return path === "" || path.endsWith("/index.html") || path.endsWith("/index");
  }

  function bindHashNavigation() {
    document.querySelectorAll('a[href*="#"]').forEach(function (link) {
      if (link.dataset.hashNavBound) return;
      link.dataset.hashNavBound = "1";

      link.addEventListener("click", function (e) {
        var raw = link.getAttribute("href");
        if (!raw || raw === "#") return;

        var url;
        try {
          url = new URL(raw, window.location.href);
        } catch (err) {
          return;
        }

        if (!url.hash) return;

        var onSamePage =
          url.pathname === window.location.pathname ||
          (isIndexPage() &&
            (url.pathname.endsWith("/index.html") ||
              url.pathname === "" ||
              url.pathname.endsWith("/")));

        if (!onSamePage) return;

        var target = document.getElementById(url.hash.slice(1));
        if (!target) return;

        e.preventDefault();
        if (url.hash !== window.location.hash) {
          history.pushState(null, "", url.hash);
        }
        scrollToHash(url.hash, "smooth");

        if (navbar && navbar.classList.contains("nav-open")) {
          navbar.classList.remove("nav-open");
          document.body.classList.remove("nav-menu-open");
          var toggle = document.getElementById("nav-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  function scrollToHashOnLoad() {
    if (!window.location.hash) return;
    var run = function () {
      scrollToHash(window.location.hash, "auto");
    };
    run();
    window.setTimeout(run, 120);
    window.setTimeout(run, 400);
  }

  bindHashNavigation();
  window.addEventListener("load", scrollToHashOnLoad);
  window.addEventListener("hashchange", function () {
    scrollToHash(window.location.hash, "smooth");
  });
})();
