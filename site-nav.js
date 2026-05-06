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
})();
