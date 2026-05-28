/**
 * Przełącznik podglądu szablonów strony głównej (index / jasna / granat / redakcyjna).
 */
(function () {
  const STORAGE_KEY = "kbn-template";
  const TEMPLATES = [
    { id: "default", label: "Domyślny", href: "./index.html" },
    { id: "jasna", label: "Jasna", href: "./index-jasna.html" },
    { id: "granat", label: "Granat", href: "./index-granat.html" },
    { id: "redakcyjna", label: "Redakcyjna", href: "./index-redakcyjna.html" },
  ];

  function detectTemplateId() {
    const path = window.location.pathname.toLowerCase();
    const file = path.split("/").pop() || "";
    if (file === "index-jasna.html" || path.includes("index-jasna")) return "jasna";
    if (file === "index-granat.html" || path.includes("index-granat")) return "granat";
    if (file === "index-redakcyjna.html" || path.includes("index-redakcyjna")) {
      return "redakcyjna";
    }
    if (file === "index.html" || file === "" || path.endsWith("/")) {
      return "default";
    }
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme && TEMPLATES.some((t) => t.id === theme)) return theme;
    return localStorage.getItem(STORAGE_KEY) || "default";
  }

  function buildSwitcher() {
    const current = detectTemplateId();
    localStorage.setItem(STORAGE_KEY, current);

    const root = document.createElement("div");
    root.className = "template-switcher";
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Przełącznik szablonu strony");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "template-switcher__toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "template-switcher-panel");
    toggle.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg><span>Szablon</span>';

    const panel = document.createElement("div");
    panel.id = "template-switcher-panel";
    panel.className = "template-switcher__panel";

    const label = document.createElement("span");
    label.className = "template-switcher__label";
    label.textContent = "Wersja strony";
    panel.appendChild(label);

    TEMPLATES.forEach((tpl) => {
      const el = document.createElement("a");
      el.className = "template-switcher__option";
      el.href = tpl.href + (window.location.hash || "");
      el.textContent = tpl.label;
      if (tpl.id === current) {
        el.classList.add("is-active");
        el.setAttribute("aria-current", "page");
      } else {
        el.addEventListener("click", () => {
          localStorage.setItem(STORAGE_KEY, tpl.id);
        });
      }
      panel.appendChild(el);
    });

    toggle.addEventListener("click", () => {
      const open = root.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) {
        root.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        root.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    root.appendChild(toggle);
    root.appendChild(panel);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildSwitcher);
  } else {
    buildSwitcher();
  }
})();
