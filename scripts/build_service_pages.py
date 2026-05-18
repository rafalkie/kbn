#!/usr/bin/env python3
from __future__ import annotations

import html
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
_ROOT = _SCRIPT_DIR.parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))
import service_pages_data as spd  # noqa: E402

MEGA_LINKS = [
    ("Budowa domów", "usluga-budowa-domow.html"),
    ("Koordynacja budowy", "usluga-koordynacja-budowy.html"),
    ("Instalacje elektryczne", "usluga-instalacje-elektryczne.html"),
    ("Instalacje hydrauliczne", "usluga-instalacje-hydrauliczne.html"),
    ("Rekuperacja", "usluga-rekuperacja.html"),
    ("Klimatyzacja", "usluga-klimatyzacja.html"),
    ("Automatyka domowa", "usluga-automatyka-domowa.html"),
    ("Monitoring &amp; alarm", "usluga-monitoring-alarm.html"),
    ("Wykończenia pod klucz", "usluga-wykonczenia-pod-klucz.html"),
    ("Projektowanie wnętrz", "usluga-projektowanie-wnetrz.html"),
]

OFFER_LINES = """              <li><a href="./usluga-budowa-domow.html">Budowa domów</a></li>
              <li><a href="./usluga-koordynacja-budowy.html">Koordynacja budowy</a></li>
              <li><a href="./usluga-instalacje-elektryczne.html">Instalacje elektryczne</a></li>
              <li><a href="./usluga-instalacje-hydrauliczne.html">Instalacje hydrauliczne</a></li>
              <li><a href="./usluga-rekuperacja.html">Rekuperacja</a></li>
              <li><a href="./usluga-klimatyzacja.html">Klimatyzacja</a></li>
              <li><a href="./usluga-automatyka-domowa.html">Automatyka domowa</a></li>
              <li><a href="./usluga-monitoring-alarm.html">Monitoring &amp; alarm</a></li>
              <li><a href="./usluga-wykonczenia-pod-klucz.html">Wykończenia pod klucz</a></li>
              <li><a href="./usluga-projektowanie-wnetrz.html">Projektowanie wnętrz</a></li>"""


def nav_mega(active_file: str) -> str:
    lines = ['                  <ul class="nav-mega-list">']
    marked_current = False
    for label, fname in MEGA_LINKS:
        base = fname.split("#", 1)[0]
        cur = ""
        if active_file and base == active_file and not marked_current:
            cur = ' aria-current="page"'
            marked_current = True
        lines.append("                    <li>")
        lines.append(f'                      <a href="./{fname}"{cur}>{label}</a>')
        lines.append("                    </li>")
    lines.append("                  </ul>")
    return "\n".join(lines)


def render_page(data: dict) -> str:
    active_file = data["file"]
    bli = "\n".join(f"                <li>{html.escape(b)}</li>" for b in data["bullets"])
    f1 = "\n".join(f"                <li>{html.escape(x)}</li>" for x in data["p1_features"])
    f2 = "\n".join(f"                <li>{html.escape(x)}</li>" for x in data["p2_features"])
    f3 = "\n".join(f"                <li>{html.escape(x)}</li>" for x in data["p3_features"])

    hero_url = data.get("hero_img_w2000") or ""
    hero_style = f' style="--svc-hero-img: url(\'{hero_url}\');"' if hero_url else ""

    classes = ["svc-g-a", "svc-g-b", "svc-g-c", "svc-g-d", "svc-g-e", "svc-g-f"]
    gal_lines = []
    for i, (href, src, alt) in enumerate(data["gallery_imgs"][:6]):
        gal_lines.append(
            f'            <a class="svc-g-item {classes[i]}" href="{html.escape(href)}" target="_blank" rel="noopener noreferrer">\n'
            f'              <img src="{html.escape(src)}" alt="{html.escape(alt)}" loading="lazy" />\n'
            f"            </a>"
        )
    gallery_block = "\n".join(gal_lines)

    return f"""<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="{html.escape(data['meta_desc'])}" />
    <title>{html.escape(data['title'])}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css" />
  </head>

  <body class="page-sub">
    <nav id="navbar">
      <div class="container">
        <div class="navbar-inner">
          <a href="./index.html" class="navbar-logo">
            <img src="logo.png" alt="KBN Signature Homes" />
          </a>

          <div class="navbar-nav-wrap" id="main-menu">
            <ul class="navbar-nav">
              <li><a href="./index.html">Strona główna</a></li>
              <li class="nav-mega">
                <a href="./index.html#services" class="nav-mega-trigger">
                  Usługi
                  <span class="nav-mega-chevron" aria-hidden="true"></span>
                </a>
                <div
                  class="nav-mega-panel"
                  role="region"
                  aria-label="Lista usług"
                >
{nav_mega(active_file)}
                </div>
              </li>
              <li><a href="./realizacje.html">Realizacje</a></li>
              <li><a href="./jak-pracujemy.html">Jak pracujemy</a></li>
              <li><a href="./kontakt.html">Kontakt</a></li>
            </ul>
          </div>

          <div class="navbar-end">
            <a href="./kontakt.html" class="btn btn-gold btn-navbar-end"
              >Zapytaj o ofertę</a
            >
          </div>

          <button
            type="button"
            class="nav-toggle"
            id="nav-toggle"
            aria-expanded="false"
            aria-controls="main-menu"
            aria-label="Otwórz lub zamknij menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>

    <main>
      <section class="svc-detail-hero" aria-labelledby="svc-h1">
        <div class="svc-detail-hero-bg"{hero_style} aria-hidden="true"></div>
        <div class="container">
          <nav class="page-breadcrumb" aria-label="Ścieżka nawigacji">
            <a href="./index.html">Strona główna</a>
            <span class="sep" aria-hidden="true">/</span>
            <a href="./index.html#services">Usługi</a>
            <span class="sep" aria-hidden="true">/</span>
            <span aria-current="page">{html.escape(data['breadcrumb'])}</span>
          </nav>
          <h1 id="svc-h1">
            {data['h1_inner']}
          </h1>
          <p class="svc-detail-lead">
            {data['lead']}
          </p>
        </div>
      </section>

      <section
        class="svc-detail-intro section-banner-depth"
        aria-labelledby="svc-intro-h2"
      >
        <div
          class="section-bg-depth"
          aria-hidden="true"
        ></div>
        <div class="container">
          <div class="svc-detail-intro-inner">
            <div>
              <div class="section-tag">{html.escape(data['intro_tag'])}</div>
              <h2 id="svc-intro-h2">
                {data['intro_h2']}
              </h2>
              <p>
                {data['intro_p1']}
              </p>
              <p>
                {data['intro_p2']}
              </p>
              <ul class="svc-detail-bullets">
{bli}
              </ul>
            </div>
            <aside class="svc-detail-intro-aside">
              <h3>{html.escape(data['aside_h3'])}</h3>
              <p>
                {data['aside_p']}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section class="svc-pkg-section" aria-labelledby="svc-pkg-heading">
        <div class="container">
          <div class="svc-pkg-head">
            <div class="section-tag">Transparentny zakres</div>
            <h2 id="svc-pkg-heading" class="section-title">
              Pakiety <span>cenowe orientacyjne</span>
            </h2>
            <p class="section-subtitle">
              {data['pkg_subtitle']}
            </p>
          </div>

          <div class="svc-pkg-grid">
            <article class="svc-pkg-card">
              <p class="svc-pkg-tier">{html.escape(data['p1_tier'])}</p>
              <h3 class="svc-pkg-name">{html.escape(data['p1_name'])}</h3>
              <p class="svc-pkg-price">
                {data['p1_price']}{data['p1_price_small']}
              </p>
              <p class="svc-pkg-desc">
                {data['p1_desc']}
              </p>
              <ul class="svc-pkg-features">
{f1}
              </ul>
              <div class="svc-pkg-actions">
                <a href="./kontakt.html" class="btn btn-outline">{html.escape(data['p1_btn'])}</a>
              </div>
            </article>

            <article class="svc-pkg-card featured">
              <span class="svc-pkg-badge">najczęściej wybierane</span>
              <p class="svc-pkg-tier">{html.escape(data['p2_tier'])}</p>
              <h3 class="svc-pkg-name">{html.escape(data['p2_name'])}</h3>
              <p class="svc-pkg-price">
                {data['p2_price']}{data['p2_price_small']}
              </p>
              <p class="svc-pkg-desc">
                {data['p2_desc']}
              </p>
              <ul class="svc-pkg-features">
{f2}
              </ul>
              <div class="svc-pkg-actions">
                <a href="./kontakt.html" class="btn btn-gold">{html.escape(data['p2_btn'])}</a>
              </div>
            </article>

            <article class="svc-pkg-card">
              <p class="svc-pkg-tier">{html.escape(data['p3_tier'])}</p>
              <h3 class="svc-pkg-name">{html.escape(data['p3_name'])}</h3>
              <p class="svc-pkg-price">
                {data['p3_price']}{data['p3_price_small']}
              </p>
              <p class="svc-pkg-desc">
                {data['p3_desc']}
              </p>
              <ul class="svc-pkg-features">
{f3}
              </ul>
              <div class="svc-pkg-actions">
                <a href="./kontakt.html" class="btn btn-outline">{html.escape(data['p3_btn'])}</a>
              </div>
            </article>
          </div>

          <p class="svc-pkg-note">
            {data['pkg_note']}
          </p>
        </div>
      </section>

      <section class="svc-gallery-section" aria-labelledby="svc-gallery-h2">
        <div class="container">
          <div class="portfolio-header">
            <div class="portfolio-header-left">
              <div class="section-tag">Wybrane kadry</div>
              <h2 id="svc-gallery-h2" class="section-title">
                {data['gallery_h2']}
              </h2>
              <p class="section-subtitle">
                {data['gallery_sub']}
              </p>
            </div>
          </div>

          <div class="svc-gallery-mosaic">
{gallery_block}
          </div>
        </div>
      </section>

      <section class="page-cta">
        <div class="container">
          <div class="section-tag" style="justify-content: center">Kolejny krok</div>
          <h2 class="section-title">
            {data['cta_h2']}
          </h2>
          <p>
            {data['cta_p']}
          </p>
          <a href="./kontakt.html" class="btn btn-gold">
            Bezpłatna konsultacja
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>
    </main>

    <footer id="footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="./index.html" class="navbar-logo">
              <img
                src="logo.png"
                alt="KBN Signature Homes"
                style="height: 64px"
              />
            </a>
            <p>
              Budujemy domy, które wyprzedzają przyszłość. Kompleksowa realizacja
              inwestycji z amerykańskim standardem w Polsce.
            </p>
          </div>

          <div class="footer-col">
            <h5>Oferta</h5>
            <ul>
{OFFER_LINES}
            </ul>
          </div>

          <div class="footer-col">
            <h5>Firma</h5>
            <ul>
              <li><a href="./realizacje.html">Realizacje</a></li>
              <li><a href="./jak-pracujemy.html">Jak pracujemy</a></li>
              <li><a href="./kontakt.html">Kontakt</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Kontakt</h5>
            <ul>
              <li><a href="tel:+48123456789">+48 123 456 789</a></li>
              <li>
                <a href="mailto:kontakt@kbnsignature.pl">kontakt@kbnsignature.pl</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>
            © 2026 <a href="./index.html">KBN Signature Homes</a>. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>

    <script>
      const navbar = document.getElementById("navbar");
      const navToggle = document.getElementById("nav-toggle");
      const mainMenu = document.getElementById("main-menu");

      function setNavOpen(open) {{
        if (!navbar) return;
        navbar.classList.toggle("nav-open", open);
        navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-menu-open", open);
      }}

      navToggle?.addEventListener("click", () => {{
        if (!navbar) return;
        setNavOpen(!navbar.classList.contains("nav-open"));
      }});

      mainMenu?.querySelectorAll("a[href]").forEach((link) => {{
        link.addEventListener("click", () => {{
          if (window.matchMedia("(max-width: 968px)").matches) {{
            if (link.classList.contains("nav-mega-trigger")) return;
            setNavOpen(false);
          }}
        }});
      }});

      window.addEventListener("keydown", (e) => {{
        if (e.key !== "Escape") return;
        if (navbar?.classList.contains("nav-open")) {{
          setNavOpen(false);
        }}
        document
          .querySelectorAll(".nav-mega.nav-mega-open")
          .forEach((el) => el.classList.remove("nav-mega-open"));
      }});

      window.addEventListener(
        "resize",
        () => {{
          if (window.matchMedia("(min-width: 969px)").matches) {{
            setNavOpen(false);
          }} else {{
            document
              .querySelectorAll(".nav-mega.nav-mega-open")
              .forEach((el) => el.classList.remove("nav-mega-open"));
          }}
        }},
        {{ passive: true }},
      );
      document.querySelectorAll(".nav-mega").forEach((mega) => {{
        let hideTimer = null;
        const isDesktop = () => window.matchMedia("(min-width: 969px)").matches;

        mega.addEventListener("mouseenter", () => {{
          if (!isDesktop()) return;
          if (hideTimer) clearTimeout(hideTimer);
          mega.classList.add("nav-mega-open");
        }});

        mega.addEventListener("mouseleave", () => {{
          if (!isDesktop()) {{
            mega.classList.remove("nav-mega-open");
            return;
          }}
          hideTimer = window.setTimeout(() => {{
            mega.classList.remove("nav-mega-open");
            hideTimer = null;
          }}, 340);
        }});
      }});
    </script>
    <script src="./site-nav.js"></script>
  </body>
</html>
"""


def main() -> None:
    for data in spd.SERVICE_PAGES:
        (_ROOT / data["file"]).write_text(render_page(data), encoding="utf-8")
        print("wrote", data["file"])


if __name__ == "__main__":
    main()
