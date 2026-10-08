/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ThemeTransitionFX — Studio-Grade Cinematic Canvas Particle & Shockwave Engine
 * ══════════════════════════════════════════════════════════════════════════════
 * Hiệu ứng chuyển đổi theme chuẩn Cinema / AAA Web App:
 * 1. Dual Shockwave Rings: 2 vòng sóng xung kích phát sáng Neon quét từ nút bấm
 * 2. Particle Sparks Explosion: 32 hạt bụi sao & tia năng lượng phát quang bùng nổ
 * 3. Chromatic Glow Trail: Vệt sáng lượng tử lan tỏa ra 4 góc màn hình
 * 4. Tự động dọn dẹp bộ nhớ và tối ưu 60-120fps bằng Canvas 2D
 * ══════════════════════════════════════════════════════════════════════════════
 */

export function triggerCinematicThemeFX({ x, y, isNextDark }) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 10000000;
    will-change: transform, opacity;
  `;
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  const maxRadius = Math.hypot(
    Math.max(x, width - x),
    Math.max(y, height - y)
  );

  // Theme Color Palette
  const colors = isNextDark
    ? ['#38bdf8', '#818cf8', '#a855f7', '#34d399', '#ffffff'] // Cosmic Cyber
    : ['#fbbf24', '#f59e0b', '#fb7185', '#f97316', '#ffffff']; // Solar Dawn

  const primaryNeon = isNextDark ? '#38bdf8' : '#fbbf24';
  const secondaryNeon = isNextDark ? '#818cf8' : '#f59e0b';

  // 1. Generate Quantum Sparks
  const particleCount = 36;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
    const speed = 3.5 + Math.random() * 8.5;
    const size = 2 + Math.random() * 4.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const isStar = Math.random() > 0.45;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      friction: 0.94 + Math.random() * 0.03,
      size,
      color,
      isStar,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
      decay: 0.018 + Math.random() * 0.02,
    });
  }

  // 2. Shockwave Rings
  let waveRadius1 = 0;
  let waveRadius2 = -30;
  const waveDuration = 650; // ms
  const startTime = performance.now();

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color, alpha) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
  }

  function render(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / waveDuration, 1);
    // Cubic Expo Easing
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    ctx.clearRect(0, 0, width, height);

    // ── Draw Dual Shockwave Corona ──────────────────────────────────────────
    waveRadius1 = easeProgress * (maxRadius * 1.15);
    waveRadius2 = Math.max(0, (easeProgress - 0.08) * (maxRadius * 1.15));

    const waveAlpha = Math.max(0, 1 - progress * 1.1);

    if (waveAlpha > 0) {
      // Outer Shockwave Wavefront
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, waveRadius1, 0, Math.PI * 2);
      ctx.strokeStyle = primaryNeon;
      ctx.lineWidth = Math.max(1, 4 * (1 - progress));
      ctx.globalAlpha = waveAlpha * 0.85;
      ctx.shadowBlur = 24 * (1 - progress);
      ctx.shadowColor = primaryNeon;
      ctx.stroke();

      // Inner Trailing Shockwave Wavefront
      if (waveRadius2 > 0) {
        ctx.beginPath();
        ctx.arc(x, y, waveRadius2, 0, Math.PI * 2);
        ctx.strokeStyle = secondaryNeon;
        ctx.lineWidth = Math.max(1, 2.5 * (1 - progress));
        ctx.globalAlpha = waveAlpha * 0.6;
        ctx.shadowBlur = 16 * (1 - progress);
        ctx.shadowColor = secondaryNeon;
        ctx.stroke();
      }
      ctx.restore();
    }

    // ── Draw Central Energy Flare Pulse ──────────────────────────────────────
    if (progress < 0.45) {
      const flashAlpha = (1 - progress / 0.45);
      const flareRadius = 35 * (1 + easeProgress * 2);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, flareRadius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, primaryNeon);
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = flashAlpha * 0.9;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, flareRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── Update & Draw Particles ─────────────────────────────────────────────
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotSpeed;
      p.alpha = Math.max(0, p.alpha - p.decay);

      if (p.alpha <= 0) continue;

      if (p.isStar) {
        drawStar(ctx, p.x, p.y, 4, p.size * 1.6, p.size * 0.6, p.color, p.alpha);
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }
    }

    if (progress < 1) {
      requestAnimationFrame(render);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(render);
}
