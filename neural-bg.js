/* ─────────────────────────────────────────────────────────────────
   KBN — Neural Network background
   Sieć z cząsteczek + pioruny (poszarpane linie, poświata) jak na KBN.
   ───────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const THEME_PRESETS = {
    jasna: {
      baseColor: "212, 176, 106",
      accentColor: "235, 218, 168",
      bgFadeRgb: "18, 32, 54",
      boltPalette: [
        { rgb: "235, 218, 168", weight: 0.45 },
        { rgb: "255, 158, 88", weight: 0.3 },
        { rgb: "110, 195, 255", weight: 0.2 },
        { rgb: "255, 108, 48", weight: 0.05 },
      ],
    },
    granat: {
      baseColor: "197, 160, 89",
      accentColor: "220, 198, 138",
      bgFadeRgb: "4, 23, 39",
      boltPalette: [
        { rgb: "220, 198, 138", weight: 0.42 },
        { rgb: "197, 160, 89", weight: 0.28 },
        { rgb: "11, 121, 190", weight: 0.18 },
        { rgb: "255, 148, 72", weight: 0.12 },
      ],
    },
    redakcyjna: {
      baseColor: "197, 160, 89",
      accentColor: "220, 198, 138",
      bgFadeRgb: "242, 243, 247",
      intensity: 0.42,
      boltPalette: [
        { rgb: "220, 198, 138", weight: 0.4 },
        { rgb: "197, 160, 89", weight: 0.3 },
        { rgb: "11, 121, 190", weight: 0.18 },
        { rgb: "255, 148, 72", weight: 0.12 },
      ],
    },
  };

  const PREFERS_REDUCED = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  class NeuralNetwork {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha: true });
      this.mouse = { x: -9999, y: -9999, active: false };
      this.particles = [];
      this.signals = [];
      this.bolts = [];
      this.lastPulse = 0;
      this.lastSignal = 0;
      this.lastBolt = 0;

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      this.isMobile = isMobile;

      this.opts = Object.assign(
        {
          density: isMobile ? 0.00005 : 0.00008,
          maxDistance: isMobile ? 95 : 130,
          baseColor: "197, 160, 89",
          accentColor: "220, 198, 138",
          boltPalette: [
            { rgb: "220, 198, 138", weight: 0.45 },
            { rgb: "255, 138, 56", weight: 0.3 },
            { rgb: "90, 180, 255", weight: 0.2 },
            { rgb: "255, 88, 32", weight: 0.05 },
          ],
          mouseRadius: isMobile ? 0 : 180,
          intensity: 0.58,
          centerGlow: true,
          bgFadeRgb: "7, 14, 28",
          boltDepth: isMobile ? 2 : 4,
          maxBolts: isMobile ? 3 : 6,
        },
        options,
      );

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
        18,
        Math.min(100, Math.round(this.w * this.h * this.opts.density)),
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
        r: 0.5 + Math.random() * 1.1,
        baseR: 0.5 + Math.random() * 1.1,
        pulse: 0,
        pulseColor: this.opts.accentColor,
        seed: Math.random() * Math.PI * 2,
      };
    }

    pickBoltColor() {
      const r = Math.random() * this._boltTotal;
      for (const c of this._boltCumulative) {
        if (r <= c.cw) return c.rgb;
      }
      return this._boltCumulative[0].rgb;
    }

    /** Poszarpana ścieżka pioruna między dwoma punktami */
    buildLightningPath(x1, y1, x2, y2, depth, maxDepth) {
      const points = [{ x: x1, y: y1 }];

      const subdivide = (ax, ay, bx, by, d) => {
        if (d >= maxDepth) {
          points.push({ x: bx, y: by });
          return;
        }
        const mx = (ax + bx) * 0.5;
        const my = (ay + by) * 0.5;
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        const jag = (1 - d / maxDepth) * (this.isMobile ? 0.22 : 0.38);
        const offset = (Math.random() - 0.5) * len * jag;
        const jx = mx + (-dy / len) * offset;
        const jy = my + (dx / len) * offset;
        subdivide(ax, ay, jx, jy, d + 1);
        subdivide(jx, jy, bx, by, d + 1);
      };

      subdivide(x1, y1, x2, y2, 0);
      return points;
    }

    pathMetrics(path) {
      const segLens = [];
      let total = 0;
      for (let i = 1; i < path.length; i++) {
        const l = Math.hypot(
          path[i].x - path[i - 1].x,
          path[i].y - path[i - 1].y,
        );
        segLens.push(l);
        total += l;
      }
      return { segLens, totalLen: total || 1 };
    }

    findClosestNeighbor(p, exclude) {
      let best = null;
      let bestD = this.opts.maxDistance;
      for (const other of this.particles) {
        if (other === p || other === exclude) continue;
        const d = Math.hypot(p.x - other.x, p.y - other.y);
        if (d < bestD) {
          bestD = d;
          best = other;
        }
      }
      return best;
    }

    createBoltBetween(ax, ay, bx, by, color) {
      const path = this.buildLightningPath(
        ax,
        ay,
        bx,
        by,
        0,
        this.opts.boltDepth,
      );
      return {
        path,
        color: color || this.pickBoltColor(),
        life: 1,
        decay: 0.028 + Math.random() * 0.022,
        width: 1.1 + Math.random() * 1.4,
      };
    }

    triggerPulse() {
      const p =
        this.particles[Math.floor(Math.random() * this.particles.length)];
      if (!p) return;
      const color = this.pickBoltColor();
      p.pulse = 1;
      p.pulseColor = color;

      const neighbor = this.findClosestNeighbor(p);
      if (
        neighbor &&
        Math.random() < 0.28 &&
        this.bolts.length < this.opts.maxBolts
      ) {
        this.bolts.push(
          this.createBoltBetween(p.x, p.y, neighbor.x, neighbor.y, color),
        );
      }
    }

    triggerSignal() {
      if (this.particles.length < 2) return;
      const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
      const p2 = this.findClosestNeighbor(p1);
      if (!p2) return;

      const path = this.buildLightningPath(
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        0,
        this.opts.boltDepth,
      );
      const { segLens, totalLen } = this.pathMetrics(path);

      this.signals.push({
        from: p1,
        to: p2,
        path,
        segLens,
        totalLen,
        t: 0,
        speed: 0.014 + Math.random() * 0.016,
        color: this.pickBoltColor(),
        width: 1.4 + Math.random() * 0.8,
      });
    }

    triggerFlashBolt() {
      if (this.particles.length < 2 || this.bolts.length >= this.opts.maxBolts) {
        return;
      }
      const p1 = this.particles[Math.floor(Math.random() * this.particles.length)];
      const p2 = this.findClosestNeighbor(p1);
      if (!p2) return;

      const bolt = this.createBoltBetween(p1.x, p1.y, p2.x, p2.y);
      bolt.decay = 0.02 + Math.random() * 0.015;
      bolt.width = 1.6 + Math.random() * 1.2;
      this.bolts.push(bolt);

      if (!this.isMobile && Math.random() < 0.15 && this.bolts.length < this.opts.maxBolts) {
        const mid = bolt.path[Math.floor(bolt.path.length / 2)];
        const angle = Math.random() * Math.PI * 2;
        const len = 25 + Math.random() * 45;
        const bx = mid.x + Math.cos(angle) * len;
        const by = mid.y + Math.sin(angle) * len;
        const branch = this.createBoltBetween(mid.x, mid.y, bx, by, bolt.color);
        branch.width *= 0.65;
        branch.decay *= 1.15;
        this.bolts.push(branch);
      }
    }

    /** Wielowarstwowy rysunek linii pioruna */
    drawLightningBolt(ctx, points, color, alpha, width) {
      if (points.length < 2 || alpha < 0.02) return;

      const strokePath = () => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      };

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.shadowColor = `rgba(${color}, ${alpha * 0.9})`;
      ctx.shadowBlur = 10 * this.opts.intensity;
      ctx.strokeStyle = `rgba(${color}, ${alpha * 0.12})`;
      ctx.lineWidth = width * 7;
      strokePath();

      ctx.shadowBlur = 8;
      ctx.strokeStyle = `rgba(${color}, ${alpha * 0.28})`;
      ctx.lineWidth = width * 3.2;
      strokePath();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(${color}, ${alpha * 0.65})`;
      ctx.lineWidth = width * 1.35;
      strokePath();

      ctx.strokeStyle = `rgba(255, 252, 238, ${alpha * 0.55})`;
      ctx.lineWidth = width * 0.45;
      strokePath();

      ctx.restore();
    }

    getPointAlongPath(path, segLens, dist) {
      let remaining = dist;
      for (let i = 0; i < segLens.length; i++) {
        if (remaining <= segLens[i]) {
          const a = path[i];
          const b = path[i + 1];
          const f = remaining / segLens[i];
          return {
            x: a.x + (b.x - a.x) * f,
            y: a.y + (b.y - a.y) * f,
            segIndex: i,
            segT: f,
          };
        }
        remaining -= segLens[i];
      }
      const last = path[path.length - 1];
      return {
        x: last.x,
        y: last.y,
        segIndex: Math.max(0, segLens.length - 1),
        segT: 1,
      };
    }

    buildPartialPath(path, segIndex, segT) {
      const partial = [];
      for (let i = 0; i <= segIndex; i++) {
        partial.push(path[i]);
      }
      const a = path[segIndex];
      const b = path[segIndex + 1];
      if (b) {
        partial.push({
          x: a.x + (b.x - a.x) * segT,
          y: a.y + (b.y - a.y) * segT,
        });
      }
      return partial;
    }

    loop(ts) {
      const ctx = this.ctx;
      const { w, h } = this;
      const inten = this.opts.intensity;

      if (ts - this.lastPulse > 480) {
        this.triggerPulse();
        this.lastPulse = ts;
      }
      if (ts - this.lastSignal > 750) {
        this.triggerSignal();
        this.lastSignal = ts;
      }
      if (ts - this.lastBolt > 1600) {
        this.triggerFlashBolt();
        this.lastBolt = ts;
      }

      ctx.clearRect(0, 0, w, h);

      if (this.opts.centerGlow) {
        const cx = w * 0.5;
        const cy = h * 0.55;
        const radius = Math.min(w, h) * 0.55;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${this.opts.accentColor}, 0.06)`);
        grad.addColorStop(0.45, `rgba(${this.opts.baseColor}, 0.025)`);
        grad.addColorStop(1, `rgba(${this.opts.bgFadeRgb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        else if (p.y > h + 10) p.y = -10;

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

        p.vx *= 0.985;
        p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.04) p.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(p.vy) < 0.04) p.vy += (Math.random() - 0.5) * 0.02;
        p.pulse *= 0.93;
      }

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
          const alpha = Math.min(1, t * 0.14 + pulse * 0.28) * inten;
          ctx.strokeStyle = `rgba(${this.opts.baseColor}, ${alpha})`;
          ctx.lineWidth = 0.3 + pulse * 0.35;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.life -= b.decay;
        if (b.life <= 0) {
          this.bolts.splice(i, 1);
          continue;
        }
        this.drawLightningBolt(ctx, b.path, b.color, b.life * inten, b.width);
      }

      if (this.mouse.active) {
        for (const p of this.particles) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < this.opts.mouseRadius) {
            const t = 1 - d / this.opts.mouseRadius;
            const pts = this.buildLightningPath(
              p.x,
              p.y,
              this.mouse.x,
              this.mouse.y,
              0,
              Math.max(2, this.opts.boltDepth - 2),
            );
            this.drawLightningBolt(
              ctx,
              pts,
              this.opts.accentColor,
              t * 0.28 * inten,
              0.75,
            );
          }
        }
      }

      for (let i = this.signals.length - 1; i >= 0; i--) {
        const s = this.signals[i];
        s.t += s.speed;
        if (s.t >= 1) {
          s.to.pulse = 1;
          s.to.pulseColor = s.color;
          if (this.bolts.length < this.opts.maxBolts) {
            this.bolts.push(
              this.createBoltBetween(s.from.x, s.from.y, s.to.x, s.to.y, s.color),
            );
          }
          this.signals.splice(i, 1);
          continue;
        }

        const headDist = s.t * s.totalLen;
        const head = this.getPointAlongPath(s.path, s.segLens, headDist);
        const visible = this.buildPartialPath(s.path, head.segIndex, head.segT);

        if (visible.length >= 2) {
          this.drawLightningBolt(
            ctx,
            visible,
            s.color,
            0.72 * inten,
            s.width * 0.85,
          );
        }

        const haloGrad = ctx.createRadialGradient(
          head.x,
          head.y,
          0,
          head.x,
          head.y,
          16,
        );
        haloGrad.addColorStop(0, `rgba(${s.color}, 0.45)`);
        haloGrad.addColorStop(1, `rgba(${s.color}, 0)`);
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 252, 240, ${0.75 * inten})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of this.particles) {
        const r = p.baseR + p.pulse * 1.2;
        if (p.pulse > 0.12) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
          g.addColorStop(0, `rgba(${p.pulseColor}, ${0.38 * p.pulse})`);
          g.addColorStop(1, `rgba(${this.opts.bgFadeRgb}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        const coreColor =
          p.pulse > 0.15 ? p.pulseColor : this.opts.accentColor;
        ctx.fillStyle = `rgba(${coreColor}, ${0.55 + p.pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(this.loop);
    }

    drawStatic() {
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
      if (cv.dataset.neuralTheme && THEME_PRESETS[cv.dataset.neuralTheme]) {
        Object.assign(opts, THEME_PRESETS[cv.dataset.neuralTheme]);
      }
      new NeuralNetwork(cv, opts);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
