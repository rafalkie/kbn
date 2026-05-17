/* ─────────────────────────────────────────────────────────────────
   KBN — Neural Network background
   Interaktywna sieć cząsteczek inspirowana grafiką na samochodzie KBN.
   Złote „neurony" łączą się liniami, reagują na kursor i pulsują.
   ───────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const PREFERS_REDUCED = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  class NeuralNetwork {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: true });
      this.mouse = { x: -9999, y: -9999, active: false };
      this.particles = [];
      this.signals = []; // bursts of energy traveling along connections
      this.lastPulse = 0;
      this.lastSignal = 0;

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      this.opts = Object.assign(
        {
          density: isMobile ? 0.00009 : 0.00014, // particles per px²
          maxDistance: isMobile ? 110 : 150,
          baseColor: "197, 160, 89", // złoto jak w herbie (metaliczny środek)
          accentColor: "220, 198, 138", // stonowany highlight (mniej „szkła”)
          // Paleta „piorunów" — jak na samochodzie KBN:
          // dominujące złoto + elektryczne pomarańczowe i niebieskie iskry.
          // Każdy element: [rgb, waga losowania]
          boltPalette: [
            { rgb: "220, 198, 138", weight: 0.45 }, // złoto bez mocnego połysku
            { rgb: "255, 138, 56", weight: 0.3 }, // elektryczny pomarańcz
            { rgb: "90, 180, 255", weight: 0.2 }, // elektryczny niebieski
            { rgb: "255, 88, 32", weight: 0.05 }, // rzadki rozżarzony czerwono-pomarańcz
          ],
          mouseRadius: isMobile ? 0 : 200,
          intensity: 1,
          centerGlow: true,
        },
        options,
      );

      // pre-compute cumulative weights for fast color picking
      this._boltCumulative = [];
      let acc = 0;
      for (const c of this.opts.boltPalette) {
        acc += c.weight;
        this._boltCumulative.push({ rgb: c.rgb, cw: acc });
      }
      this._boltTotal = acc;

      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.bindEvents();
      this.resize();
      this.spawn();

      if (!PREFERS_REDUCED) {
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
      } else {
        this.drawStatic();
      }
    }

    bindEvents() {
      this._onResize = () => {
        this.resize();
        this.spawn();
      };
      window.addEventListener("resize", this._onResize, { passive: true });

      if (this.opts.mouseRadius > 0) {
        this._onMove = (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
            this.mouse.x = x;
            this.mouse.y = y;
            this.mouse.active = true;
          } else {
            this.mouse.active = false;
          }
        };
        this._onLeave = () => {
          this.mouse.active = false;
        };
        window.addEventListener("mousemove", this._onMove, { passive: true });
        document.addEventListener("mouseleave", this._onLeave);
      }
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = this.w * this.dpr;
      this.canvas.height = this.h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    spawn() {
      const count = Math.max(
        24,
        Math.min(180, Math.round(this.w * this.h * this.opts.density)),
      );
      const existing = this.particles.length;

      if (count > existing) {
        for (let i = existing; i < count; i++) {
          this.particles.push(this.createParticle());
        }
      } else if (count < existing) {
        this.particles.length = count;
      }
    }

    createParticle() {
      const a = Math.random() * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.25;
      return {
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: 0.6 + Math.random() * 1.4,
        baseR: 0.6 + Math.random() * 1.4,
        pulse: 0,
        pulseColor: this.opts.accentColor, // domyślnie złoto
        seed: Math.random() * Math.PI * 2,
      };
    }

    triggerPulse() {
      // ignite a random particle so the network "fires"
      const p = this.particles[Math.floor(Math.random() * this.particles.length)];
      if (p) {
        p.pulse = 1;
        p.pulseColor = this.pickBoltColor();
      }
    }

    pickBoltColor() {
      const r = Math.random() * this._boltTotal;
      for (const c of this._boltCumulative) {
        if (r <= c.cw) return c.rgb;
      }
      return this._boltCumulative[0].rgb;
    }

    triggerSignal() {
      // create a moving signal along a connection
      if (this.particles.length < 2) return;
      const i = Math.floor(Math.random() * this.particles.length);
      const p1 = this.particles[i];
      // find closest neighbor within max distance
      let best = null;
      let bestD = this.opts.maxDistance;
      for (let j = 0; j < this.particles.length; j++) {
        if (j === i) continue;
        const p2 = this.particles[j];
        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (d < bestD) {
          bestD = d;
          best = p2;
        }
      }
      if (!best) return;
      this.signals.push({
        from: p1,
        to: best,
        t: 0,
        speed: 0.012 + Math.random() * 0.018,
        color: this.pickBoltColor(),
      });
    }

    loop(ts) {
      const ctx = this.ctx;
      const { w, h } = this;

      // periodic neuron firings
      if (ts - this.lastPulse > 280) {
        this.triggerPulse();
        this.lastPulse = ts;
      }
      if (ts - this.lastSignal > 520) {
        this.triggerSignal();
        this.lastSignal = ts;
      }

      ctx.clearRect(0, 0, w, h);

      // ── central radial glow (mimics van logo aura) ──
      if (this.opts.centerGlow) {
        const cx = w * 0.5;
        const cy = h * 0.55;
        const radius = Math.min(w, h) * 0.55;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${this.opts.accentColor}, 0.12)`);
        grad.addColorStop(0.45, `rgba(${this.opts.baseColor}, 0.05)`);
        grad.addColorStop(1, "rgba(7, 14, 28, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── update particles ──
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        // wrap softly
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;

        // mouse attraction (light)
        if (this.mouse.active) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < this.opts.mouseRadius && d > 0.01) {
            const f = (1 - d / this.opts.mouseRadius) * 0.04;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // friction so velocities don't run away
        p.vx *= 0.985;
        p.vy *= 0.985;
        // keep minimum drift
        if (Math.abs(p.vx) < 0.04) p.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(p.vy) < 0.04) p.vy += (Math.random() - 0.5) * 0.02;

        p.pulse *= 0.95;
      }

      // ── connections ──
      const maxD = this.opts.maxDistance;
      const maxD2 = maxD * maxD;
      ctx.lineCap = "round";

      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > maxD2) continue;
          const d = Math.sqrt(d2);
          const t = 1 - d / maxD;
          const pulse = Math.max(p1.pulse, p2.pulse);
          const alpha = Math.min(1, t * 0.32 + pulse * 0.55) * this.opts.intensity;
          ctx.strokeStyle = `rgba(${this.opts.baseColor}, ${alpha})`;
          ctx.lineWidth = 0.45 + pulse * 0.7;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // ── mouse tether lines ──
      if (this.mouse.active) {
        for (const p of this.particles) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < this.opts.mouseRadius) {
            const t = 1 - d / this.opts.mouseRadius;
            ctx.strokeStyle = `rgba(${this.opts.accentColor}, ${t * 0.55})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(this.mouse.x, this.mouse.y);
            ctx.stroke();
          }
        }
      }

      // ── traveling signals (pioruny) ──
      for (let i = this.signals.length - 1; i >= 0; i--) {
        const s = this.signals[i];
        s.t += s.speed;
        if (s.t >= 1) {
          // arrived → ignite target w kolorze pioruna
          s.to.pulse = 1;
          s.to.pulseColor = s.color;
          this.signals.splice(i, 1);
          continue;
        }
        const x = s.from.x + (s.to.x - s.from.x) * s.t;
        const y = s.from.y + (s.to.y - s.from.y) * s.t;

        // smuga (trail) — gradient w kolorze pioruna
        const trailX = s.from.x + (s.to.x - s.from.x) * Math.max(0, s.t - 0.22);
        const trailY = s.from.y + (s.to.y - s.from.y) * Math.max(0, s.t - 0.22);
        const grad = ctx.createLinearGradient(trailX, trailY, x, y);
        grad.addColorStop(0, `rgba(${s.color}, 0)`);
        grad.addColorStop(0.6, `rgba(${s.color}, 0.55)`);
        grad.addColorStop(1, `rgba(${s.color}, 0.98)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // poświata wokół głowy iskry
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, 12);
        haloGrad.addColorStop(0, `rgba(${s.color}, 0.55)`);
        haloGrad.addColorStop(1, `rgba(${s.color}, 0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();

        // jasna głowa
        ctx.fillStyle = `rgba(${s.color}, 1)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── particles + their glow (w kolorze ostatniego pulsu) ──
      for (const p of this.particles) {
        const r = p.baseR + p.pulse * 1.4;
        if (p.pulse > 0.08) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 7);
          g.addColorStop(0, `rgba(${p.pulseColor}, ${0.6 * p.pulse})`);
          g.addColorStop(1, "rgba(7, 14, 28, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 7, 0, Math.PI * 2);
          ctx.fill();
        }
        // jasny rdzeń: miesza złoto bazowe z kolorem pulsu (jeśli aktywny)
        const coreColor =
          p.pulse > 0.15 ? p.pulseColor : this.opts.accentColor;
        ctx.fillStyle = `rgba(${coreColor}, ${0.85 + p.pulse * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(this.loop);
    }

    drawStatic() {
      // fallback for users who prefer reduced motion: render a single frame
      this.loop(0);
    }
  }

  function boot() {
    document.querySelectorAll("canvas[data-neural]").forEach((cv) => {
      const opts = {};
      if (cv.dataset.density) opts.density = parseFloat(cv.dataset.density);
      if (cv.dataset.distance) opts.maxDistance = parseFloat(cv.dataset.distance);
      if (cv.dataset.intensity) opts.intensity = parseFloat(cv.dataset.intensity);
      if (cv.dataset.glow === "false") opts.centerGlow = false;
      if (cv.dataset.mouse === "false") opts.mouseRadius = 0;
      new NeuralNetwork(cv, opts);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
