(function () {
  var STORAGE_KEY = "kbn-nav-version";
  var VALID = ["v1", "v2", "v2.1", "v2.2", "v3"];
  var root = document.documentElement;

  function normalizeVersion(version) {
    return VALID.indexOf(version) >= 0 ? version : "v1";
  }

  function getVersion() {
    try {
      return normalizeVersion(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return "v1";
    }
  }

  function setVersion(version) {
    var v = normalizeVersion(version);
    root.setAttribute("data-nav", v);
    root.classList.toggle("nav-v2-active", v === "v2" || v === "v2.1" || v === "v2.2");
    root.classList.toggle("nav-v3-active", v === "v3");
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch (e) {
      /* ignore */
    }
    document.querySelectorAll(".menu-variant-switcher__btn").forEach(function (btn) {
      var active = btn.getAttribute("data-nav") === v;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function injectPhoneLink() {
    var end = document.querySelector(".navbar-end");
    if (end && !end.querySelector(".navbar-phone")) {
      var phone = document.createElement("a");
      phone.className = "navbar-phone";
      phone.href = "tel:+48123456789";
      phone.innerHTML =
        '<span class="navbar-phone-label">Zadzwoń</span>' +
        '<span class="navbar-phone-num">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>' +
        "</svg> +48 123 456 789</span>";
      end.insertBefore(phone, end.firstChild);
    }

    var nav = document.querySelector(".navbar-nav");
    if (nav && !nav.querySelector(".navbar-phone-mobile")) {
      var li = document.createElement("li");
      li.className = "navbar-phone-mobile";
      var mobilePhone = document.createElement("a");
      mobilePhone.className = "navbar-phone navbar-phone--mobile";
      mobilePhone.href = "tel:+48123456789";
      mobilePhone.innerHTML =
        '<span class="navbar-phone-label">Zadzwoń</span>' +
        '<span class="navbar-phone-num">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>' +
        "</svg> +48 123 456 789</span>";
      li.appendChild(mobilePhone);
      nav.appendChild(li);
    }
  }

  function buildSwitcher() {
    if (document.querySelector(".menu-variant-switcher")) return;

    var wrap = document.createElement("div");
    wrap.className = "menu-variant-switcher";
    wrap.setAttribute("aria-label", "Wersja menu");

    var label = document.createElement("span");
    label.className = "menu-variant-switcher__label";
    label.textContent = "Menu";

    VALID.forEach(function (version) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-variant-switcher__btn";
      btn.setAttribute("data-nav", version);
      btn.textContent = version;
      btn.addEventListener("click", function () {
        setVersion(version);
      });
      wrap.appendChild(btn);
    });

    wrap.insertBefore(label, wrap.firstChild);
    document.body.appendChild(wrap);
  }

  injectPhoneLink();
  buildSwitcher();
  setVersion(getVersion());
})();
