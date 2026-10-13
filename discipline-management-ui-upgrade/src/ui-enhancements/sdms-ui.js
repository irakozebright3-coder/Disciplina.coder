/**
 * SDMS visual enhancements.
 * Framework-agnostic: works with React/Vite or plain HTML.
 * Import once from the app entry point. No Java dependency.
 */
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;

export function initLiquidButtons(root = document) {
  const selector = "button, [role='button'], .button, .btn";
  const bind = (button) => {
    if (button.dataset.sdmsLiquidBound) return;
    button.dataset.sdmsLiquidBound = "true";
    button.classList.add("sdms-liquid");
    const move = (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      button.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    button.addEventListener("pointermove", move);
  };
  root.querySelectorAll(selector).forEach(bind);
  return () => root.querySelectorAll("[data-sdms-liquid-bound]").forEach((el) => {
    el.removeAttribute("data-sdms-liquid-bound");
    el.classList.remove("sdms-liquid");
  });
}

export function initCircleDotCursor() {
  if (reducedMotion || coarsePointer || !document.body) return () => {};
  const ring = document.createElement("span");
  const dot = document.createElement("span");
  ring.className = "sdms-cursor-ring";
  dot.className = "sdms-cursor-dot";
  ring.setAttribute("aria-hidden", "true");
  dot.setAttribute("aria-hidden", "true");
  document.body.append(ring, dot);

  let x = -100, y = -100, rx = x, ry = y, raf = 0;
  const paint = () => {
    rx += (x - rx) * 0.2;
    ry += (y - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    raf = requestAnimationFrame(paint);
  };
  const move = (e) => {
    x = e.clientX; y = e.clientY;
    ring.classList.add("is-visible");
    dot.classList.add("is-visible");
  };
  const over = (e) => {
    if (e.target.closest("a,button,[role='button'],input,textarea,select,label")) ring.classList.add("is-hover");
    else ring.classList.remove("is-hover");
  };
  const leave = () => { ring.classList.remove("is-visible", "is-hover"); dot.classList.remove("is-visible"); };
  window.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerover", over, { passive: true });
  document.addEventListener("pointerleave", leave);
  raf = requestAnimationFrame(paint);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", move);
    document.removeEventListener("pointerover", over);
    document.removeEventListener("pointerleave", leave);
    ring.remove(); dot.remove();
  };
}

export function initCanvasAmbientBackground(canvas) {
  if (!canvas || reducedMotion) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const parent = canvas.parentElement || document.body;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0, raf = 0;
  const particles = [];
  const countForWidth = (w) => Math.min(64, Math.max(22, Math.floor(w / 22)));
  const resize = () => {
    const rect = parent.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.length = 0;
    for (let i = 0; i < countForWidth(width); i++) {
      particles.push({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        r: 1 + Math.random() * 1.7
      });
    }
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = width + 5;
      if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5;
      if (p.y > height + 5) p.y = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(112, 104, 226, .28)";
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
        if (dist < 115) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(112, 104, 226, ${.12 * (1 - dist / 115)})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(parent);
  resize(); raf = requestAnimationFrame(draw);
  return () => { cancelAnimationFrame(raf); observer.disconnect(); ctx.clearRect(0, 0, width, height); };
}

export function initSDMSUI({ canvasSelector = "[data-sdms-canvas]", liquidButtons = true, cursor = true } = {}) {
  const cleanups = [];
  if (liquidButtons) cleanups.push(initLiquidButtons());
  if (cursor) cleanups.push(initCircleDotCursor());
  document.querySelectorAll(canvasSelector).forEach((canvas) => cleanups.push(initCanvasAmbientBackground(canvas)));
  return () => cleanups.forEach((cleanup) => cleanup?.());
}
