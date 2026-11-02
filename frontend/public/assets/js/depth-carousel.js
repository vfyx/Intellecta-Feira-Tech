/**
 * DepthCarousel - React Bits Component Adapted for Vanilla JavaScript + Intellecta
 * Features:
 * - 3D Perspective Depth Tilt rail animation
 * - GSAP tweening with easing
 * - Inertial pointer drag / swipe with velocity projection
 * - Mouse wheel scrolling with snap
 * - Keyboard navigation (Left / Right arrows)
 * - Autoplay support with hover & focus pause
 * - Responsive ResizeObserver card scaling
 * - Reduced motion support (prefers-reduced-motion)
 */
class DepthCarousel {
  constructor(container, options = {}) {
    if (!container) return;
    if (container.__depthCarousel) {
      container.__depthCarousel.destroy();
    }

    this.container = container;
    this.options = Object.assign(
      {
        items: [],
        cardWidth: 260,
        cardHeight: 330,
        radius: 18,
        tint: '#0b0e0a',
        depth: 180,
        spread: 70,
        tilt: 18,
        tiltDirection: 'right',
        perspective: 1400,
        visibleCards: 4,
        falloff: 0.2,
        blur: 5,
        duration: 700,
        ease: 'power3.out',
        autoplay: false,
        autoplayDelay: 3200,
        loop: true,
        showControls: true,
        showIndicators: true,
        showBadge: true,
        onChange: null,
        className: ''
      },
      options
    );

    this.data = (Array.isArray(this.options.items) ? this.options.items : []).map(it =>
      typeof it === 'string' ? { image: it, alt: '' } : it
    );
    this.count = this.data.length;

    this.pos = 0;
    this.focusIndex = 0;
    this.scale = 1;
    this.active = 0;
    this.drag = null;
    this.wheelTimer = null;
    this.autoTimer = null;
    this.tween = null;
    this.ro = null;
    this._cleanups = [];

    this.cardRefs = [];
    this.overlayRefs = [];
    this.dotRefs = [];

    if (this.count === 0) return;

    this._initDOM();
    this._bindEvents();
    this.layout(this.pos);

    this.container.__depthCarousel = this;
  }

  _clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  _initDOM() {
    this.container.innerHTML = '';

    const root = document.createElement('div');
    root.className = `depth-carousel ${this.options.className}`.trim();
    root.style.setProperty('--dc-perspective', `${this.options.perspective}px`);
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', 'Galeria de fotos');
    root.tabIndex = 0;
    this.root = root;

    const stage = document.createElement('div');
    stage.className = 'depth-carousel__stage';
    this.stage = stage;
    root.appendChild(stage);

    this.cardRefs = [];
    this.overlayRefs = [];
    this.dotRefs = [];

    for (let i = 0; i < this.count; i++) {
      const item = this.data[i];

      const card = document.createElement('div');
      card.className = 'depth-carousel__card';
      card.style.width = `${this.options.cardWidth}px`;
      card.style.height = `${this.options.cardHeight}px`;
      card.style.borderRadius = `${this.options.radius}px`;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${i + 1} de ${this.count}`);
      card.setAttribute('aria-hidden', String(i !== 0));

      const img = document.createElement('img');
      img.className = 'depth-carousel__img';
      img.src = item.image;
      img.alt = item.alt || `Foto ${i + 1}`;
      img.draggable = false;
      img.loading = 'lazy';
      card.appendChild(img);

      const tint = document.createElement('span');
      tint.className = 'depth-carousel__tint';
      tint.style.background = this.options.tint;
      card.appendChild(tint);

      card.addEventListener('click', () => {
        if (this.drag?.moved || performance.now() < (this.suppressClickUntil || 0)) return;
        this.setFocus(i, true);
      });

      stage.appendChild(card);
      this.cardRefs.push(card);
      this.overlayRefs.push(tint);
    }

    if (this.options.showControls && this.count > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'depth-carousel__arrow depth-carousel__arrow--prev';
      prevBtn.setAttribute('aria-label', 'Slide anterior');
      prevBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.navigateBy(-1);
      });
      root.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'depth-carousel__arrow depth-carousel__arrow--next';
      nextBtn.setAttribute('aria-label', 'Próximo slide');
      nextBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        this.navigateBy(1);
      });
      root.appendChild(nextBtn);
    }

    if (this.options.showIndicators && this.count > 1) {
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'depth-carousel__dots';
      dotsWrap.setAttribute('role', 'group');
      dotsWrap.setAttribute('aria-label', 'Slides');

      for (let i = 0; i < this.count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `depth-carousel__dot${i === 0 ? ' is-active' : ''}`;
        dot.setAttribute('aria-pressed', String(i === 0));
        dot.setAttribute('aria-pressed', String(i === 0));
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.addEventListener('click', e => {
          e.stopPropagation();
          this.setFocus(i, true);
        });
        dotsWrap.appendChild(dot);
        this.dotRefs.push(dot);
      }
      root.appendChild(dotsWrap);
    }

    if (this.options.showBadge && this.count > 1) {
      const badge = document.createElement('div');
      badge.className = 'depth-carousel__badge';
      badge.textContent = `1 / ${this.count}`;
      root.appendChild(badge);
      this.badgeEl = badge;
    }

    this.container.appendChild(root);
  }

  layout(pos) {
    const cfg = this.options;
    const n = this.count;
    if (!n) return;
    const dir = cfg.tiltDirection === 'left' ? -1 : 1;
    const sc = this.scale;

    for (let i = 0; i < n; i++) {
      const el = this.cardRefs[i];
      if (!el) continue;

      let d = i - pos;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }

      const back = Math.max(0, d);
      const az = Math.abs(d);
      const shown = az <= cfg.visibleCards + 0.5;

      const tz = -cfg.depth * d;
      const tx = dir * cfg.spread * d;
      const ry = dir * cfg.tilt * this._clamp(d, 0, 1);

      let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
      if (!shown) opacity = 0;

      const brightness = Math.max(0.15, 1 - back * cfg.falloff);
      const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
      const zi = Math.round(2000 - d * 20);

      el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
      el.style.zIndex = String(zi);
      el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';

      const ov = this.overlayRefs[i];
      if (ov) {
        ov.style.opacity = this._clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
      }
    }
  }

  _notify(idx) {
    this.active = idx;
    this.dotRefs.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === idx);
      dot.setAttribute('aria-pressed', String(i === idx));
    });
    this.cardRefs.forEach((card, i) => {
      card.setAttribute('aria-hidden', String(i !== idx));
    });
    if (this.badgeEl) {
      this.badgeEl.textContent = `${idx + 1} / ${this.count}`;
    }
    this.options.onChange?.(idx, this.data[idx]);
  }

  tweenTo(target, animate = true) {
    this.tween?.kill();
    const cfg = this.options;
    const proxy = { p: this.pos };
    const dur = animate && !this.reducedMotion ? cfg.duration / 1000 : 0;

    if (window.gsap && dur > 0) {
      this.tween = window.gsap.to(proxy, {
        p: target,
        duration: dur,
        ease: cfg.ease,
        onUpdate: () => {
          this.pos = proxy.p;
          this.layout(proxy.p);
        },
        onComplete: () => {
          const n = this.count;
          if (n > 0) this.pos = ((this.pos % n) + n) % n;
          this.layout(this.pos);
        }
      });
    } else {
      this.pos = target;
      const n = this.count;
      if (n > 0) this.pos = ((this.pos % n) + n) % n;
      this.layout(this.pos);
    }
  }

  setFocus(rawIndex, animate = true) {
    const cfg = this.options;
    const n = this.count;
    if (!n) return;
    const idx = cfg.loop ? ((rawIndex % n) + n) % n : this._clamp(rawIndex, 0, n - 1);
    let delta = idx - this.pos;
    if (cfg.loop && n > 1) {
      delta = ((delta % n) + n) % n;
      if (delta > n / 2) delta -= n;
    }
    this.tweenTo(this.pos + delta, animate);
    if (idx !== this.focusIndex) {
      this.focusIndex = idx;
      this._notify(idx);
    }
  }

  navigateBy(step) {
    this.setFocus(this.focusIndex + step, true);
  }

  _bindEvents() {
    const root = this.root;
    if (!root) return;

    this.reducedMotion = this.options.reducedMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // ResizeObserver
    this.ro = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const w = entries[0].contentRect.width;
      const cfg = this.options;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      this.scale = this._clamp(w / needed, 0.42, 1);
      this.layout(this.pos);
    });
    this.ro.observe(root);

    // Mouse Wheel
    const onWheel = e => {
      if (this.count < 2 || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) return;
      e.preventDefault();
      this.tween?.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = this._clamp(delta / (this.options.cardWidth * 0.9), -0.6, 0.6);
      this.pos += step;
      this.layout(this.pos);
      if (this.wheelTimer) clearTimeout(this.wheelTimer);
      this.wheelTimer = setTimeout(() => this.setFocus(Math.round(this.pos), true), 130);
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    this._cleanups.push(() => root.removeEventListener('wheel', onWheel));

    // Pointer Drag
    const onPointerDown = e => {
      if (this.count < 2 || e.button !== 0 || e.target.closest('button')) return;
      this.tween?.kill();
      this.drag = {
        x: e.clientX,
        startPos: this.pos,
        lastX: e.clientX,
        lastT: performance.now(),
        v: 0,
        moved: false,
        id: e.pointerId
      };
    };

    const onPointerMove = e => {
      const drag = this.drag;
      if (!drag) return;
      const cfg = this.options;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * this.scale, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        drag.moved = true;
        root.setPointerCapture(drag.id);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      this.pos = drag.startPos - dx / stepPx;
      this.layout(this.pos);
    };

    const onPointerEnd = () => {
      const drag = this.drag;
      if (!drag) return;
      this.drag = null;
      if (!drag.moved) return;
      this.suppressClickUntil = performance.now() + 300;
      if (root.hasPointerCapture(drag.id)) root.releasePointerCapture(drag.id);
      const cfg = this.options;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * this.scale, 40);
      const projected = this.pos - (drag.v * 180) / stepPx;
      this.setFocus(Math.round(projected), true);
    };

    root.addEventListener('pointerdown', onPointerDown);
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerup', onPointerEnd);
    root.addEventListener('pointercancel', onPointerEnd);
    this._cleanups.push(() => {
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerup', onPointerEnd);
      root.removeEventListener('pointercancel', onPointerEnd);
    });

    // Keyboard navigation
    const onKeyDown = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.navigateBy(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.navigateBy(1);
      }
    };
    root.addEventListener('keydown', onKeyDown);
    this._cleanups.push(() => root.removeEventListener('keydown', onKeyDown));

    // Autoplay
    if (this.options.autoplay && !this.reducedMotion && this.count > 1) {
      let hovered = false;
      let focused = false;
      const stop = () => {
        if (this.autoTimer) clearInterval(this.autoTimer);
        this.autoTimer = null;
      };
      const start = () => {
        stop();
        this.autoTimer = window.setInterval(
          () => {
            if (!hovered && !focused) this.navigateBy(1);
          },
          Math.max(this.options.autoplayDelay, 600)
        );
      };
      const onEnter = () => { hovered = true; };
      const onLeave = () => { hovered = false; };
      const onFocusIn = () => { focused = true; };
      const onFocusOut = () => { focused = false; };

      root.addEventListener('mouseenter', onEnter);
      root.addEventListener('mouseleave', onLeave);
      root.addEventListener('focusin', onFocusIn);
      root.addEventListener('focusout', onFocusOut);
      start();

      this._cleanups.push(() => {
        stop();
        root.removeEventListener('mouseenter', onEnter);
        root.removeEventListener('mouseleave', onLeave);
        root.removeEventListener('focusin', onFocusIn);
        root.removeEventListener('focusout', onFocusOut);
      });
    }
  }

  destroy() {
    this.tween?.kill();
    if (this.wheelTimer) clearTimeout(this.wheelTimer);
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.ro?.disconnect();
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
    if (this.root && this.root.parentElement === this.container) {
      this.root.remove();
    }
    delete this.container.__depthCarousel;
  }
}

if (typeof window !== 'undefined') {
  window.DepthCarousel = DepthCarousel;
}
