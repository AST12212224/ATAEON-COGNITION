/*
  Interactive ATAEON logo.
  The "A" is drawn in, the blue dot is a small planet with a ring and a moon.
  - Hover: the moon speeds up and the letters lift.
  - Move the cursor near a large logo: the planet is pulled toward it (gravity).
  - Click: the planet flies once around the A along its orbit and sends out a ripple.
  Use <a data-logo="nav">, <div data-logo="xl"> or <div data-logo="core">.
*/
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const ARCH = 'M383,710 L585,352 Q633,290 683,352 L873,710 Q842,714 824,688 L736,546 Q668,452 618,532 L518,710 Z';
  const DOT = { x: 730, y: 645 };
  const ORB = { cx: 628, cy: 560, rx: 270, ry: 82, tilt: -14 * Math.PI / 180 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="lgArch" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset=".55" stop-color="#dbe4ff"/><stop offset="1" stop-color="#6d7dff"/></linearGradient>
    <radialGradient id="lgDot" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#7dd3fc"/><stop offset=".45" stop-color="#3b9bff"/><stop offset="1" stop-color="#5b4bff"/></radialGradient>
    <radialGradient id="lgHalo"><stop offset="0" stop-color="#3b9bff" stop-opacity=".6"/><stop offset="1" stop-color="#5b5bff" stop-opacity="0"/></radialGradient>
  </defs></svg>`);

  const stars = [[400, 300, 3], [880, 330, 2.5], [470, 450, 2], [905, 520, 3.5], [360, 600, 2.5], [560, 780, 2], [860, 790, 3], [700, 270, 2], [780, 420, 1.8], [420, 760, 2.2]];
  function markSVG(full) {
    const vb = full ? '328 230 600 600' : '368 258 520 520';
    return `<svg class="lg-mark" viewBox="${vb}" role="img" aria-label="ATAEON Cognition">
      ${full ? stars.map((s, i) => `<circle class="star" cx="${s[0]}" cy="${s[1]}" r="${s[2]}" style="animation-delay:${(i * .37).toFixed(2)}s"/>`).join('') : ''}
      ${full ? `<ellipse class="orbit" cx="${ORB.cx}" cy="${ORB.cy}" rx="${ORB.rx}" ry="${ORB.ry}" transform="rotate(-14 ${ORB.cx} ${ORB.cy})"/>` : ''}
      <path class="arch" pathLength="1" d="${ARCH}"/>
      <g class="ripples"></g>
      <g class="core" transform="translate(${DOT.x} ${DOT.y})">
        <circle class="halo" r="80" fill="url(#lgHalo)"/>
        <g transform="rotate(-20)"><ellipse class="ring" rx="62" ry="16"/><circle class="sat back" r="6" fill="#e0f2fe"/></g>
        <circle r="37" fill="url(#lgDot)"/>
        <g transform="rotate(-20)"><circle class="sat front" r="6" fill="#e0f2fe"/></g>
      </g>
    </svg>`;
  }
  const word = () => `<span class="wm"><b>${[...'ΛTΛΞON'].map((c, i) => `<span style="transition-delay:${i * 40}ms">${c}</span>`).join('')}</b><small>COGNITION</small></span>`;

  const mouse = { x: -9999, y: -9999 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  const inst = [];
  document.querySelectorAll('[data-logo]').forEach(el => {
    const kind = el.dataset.logo, full = kind !== 'nav';
    el.innerHTML = kind === 'core' ? markSVG(true) : markSVG(full) + word();
    const svg = el.querySelector('svg');
    if (reduce) { svg.classList.add('instant'); return; }
    const s = {
      el, svg, kind, follow: kind !== 'nav',
      core: svg.querySelector('.core'), halo: svg.querySelector('.halo'),
      back: svg.querySelector('.sat.back'), front: svg.querySelector('.sat.front'),
      ripples: svg.querySelector('.ripples'),
      a: Math.random() * 6, speed: .03, hover: false, ox: 0, oy: 0, orbit: -1, rip: [], vis: true, t: 0
    };
    el.addEventListener('pointerenter', () => s.hover = true);
    el.addEventListener('pointerleave', () => s.hover = false);
    el.addEventListener('click', e => {
      if (kind === 'nav' && document.body.dataset.page === 'home') { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
      launch(s);
    });
    if (kind !== 'core') new IntersectionObserver(([en]) => s.vis = en.isIntersecting).observe(el);
    inst.push(s);
  });

  function launch(s) {
    if (s.orbit < 0) s.orbit = 0;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'ripple');
    c.setAttribute('cx', DOT.x + s.ox); c.setAttribute('cy', DOT.y + s.oy);
    s.ripples.appendChild(c); s.rip.push({ c, t: 0 });
    s.svg.querySelectorAll('.star').forEach(st => { st.style.animationDuration = '.6s'; setTimeout(() => st.style.animationDuration = '', 1600); });
  }
  // auto-launch the big logos once after they finish drawing
  setTimeout(() => inst.filter(s => s.kind !== 'nav').forEach(launch), 1900);

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const a0 = Math.atan2((DOT.y - ORB.cy) / ORB.ry, (DOT.x - ORB.cx) / ORB.rx);

  (function loop() {
    for (const s of inst) {
      if (!s.vis) continue;
      s.t += .016;
      s.speed += ((s.hover ? .11 : .035) - s.speed) * .08;
      s.a += s.speed;

      // gravity toward the cursor
      let tx = 0, ty = 0;
      if (s.follow) {
        const m = s.svg.getScreenCTM();
        if (m) {
          const p = new DOMPoint(mouse.x, mouse.y).matrixTransform(m.inverse());
          const dx = p.x - DOT.x, dy = p.y - DOT.y, d = Math.hypot(dx, dy);
          if (d < 900 && d > 1) { const k = Math.min(d * .1, 42) / d; tx = dx * k; ty = dy * k; }
        }
      }
      s.ox += (tx - s.ox) * .08; s.oy += (ty - s.oy) * .08;
      let x = DOT.x + s.ox, y = DOT.y + s.oy, sc = 1, op = 1;

      // orbit flight
      if (s.orbit >= 0) {
        s.orbit += .011;
        const k = Math.min(s.orbit, 1), ang = a0 - ease(k) * Math.PI * 2;
        const ex = ORB.rx * Math.cos(ang), ey = ORB.ry * Math.sin(ang);
        const px = ORB.cx + ex * Math.cos(ORB.tilt) - ey * Math.sin(ORB.tilt);
        const py = ORB.cy + ex * Math.sin(ORB.tilt) + ey * Math.cos(ORB.tilt);
        const w = Math.min(1, k * 10, (1 - k) * 10);
        x += (px - x) * w; y += (py - y) * w;
        const behind = Math.sin(ang) < 0;
        sc = 1 - w * (behind ? .3 : -.1); op = behind ? 1 - w * .45 : 1;
        if (s.orbit >= 1) s.orbit = -1;
      }
      s.core.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
      s.core.style.opacity = op;
      s.halo.setAttribute('r', (78 + Math.sin(s.t * 2.2) * 10 + (s.hover ? 14 : 0)).toFixed(1));

      // moon on the ring: in front or behind the planet
      const mx = Math.cos(s.a) * 62, my = Math.sin(s.a) * 16, front = Math.sin(s.a) > 0;
      s.front.setAttribute('cx', mx); s.front.setAttribute('cy', my); s.front.style.opacity = front ? 1 : 0;
      s.back.setAttribute('cx', mx); s.back.setAttribute('cy', my); s.back.style.opacity = front ? 0 : .5;

      // ripples
      s.rip = s.rip.filter(r => {
        r.t += .02;
        r.c.setAttribute('r', 37 + r.t * 260); r.c.style.opacity = Math.max(0, 1 - r.t);
        if (r.t >= 1) { r.c.remove(); return false; }
        return true;
      });
    }
    requestAnimationFrame(loop);
  })();
})();
