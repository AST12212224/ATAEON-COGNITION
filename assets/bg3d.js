/*
  3D particle background. Each section picks a shape with attributes:
    data-shape="sphere|knot|wave|helix|cube|galaxy|lorenz|torus"
    data-side="right|left|center"   data-o="0.5" (brightness)   data-core (show the logo inside the shape)
  The cursor pushes particles away, a click sends a shockwave, and scrolling morphs between shapes.
*/
(function () {
  if (!window.THREE) return;
  const canvas = document.getElementById('gl');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const M = window.MOUSE || { nx: 0, ny: 0, active: false };
  const mobile = innerWidth < 760;
  const N = mobile ? 1500 : 3000;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  camera.position.z = 8;
  const group = new THREE.Group(); scene.add(group);

  const rnd = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const TAU = Math.PI * 2;
  // Lorenz attractor, integrated once
  const lor = (() => {
    const out = []; let x = .1, y = 0, z = 0; const dt = .005;
    for (let i = 0; i < N * 3 + 300; i++) {
      const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - 8 / 3 * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
      if (i >= 300 && i % 3 === 0) out.push([x * .1, (z - 25) * .1, y * .1]);
    }
    return out;
  })();
  const shapes = {
    sphere: i => { const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), t = i * 2.39996, R = 2.3; return [Math.cos(t) * r * R, y * R, Math.sin(t) * r * R]; },
    knot: i => {
      const t = i / N * TAU, r = 1.4 + .55 * Math.cos(3 * t), a = rnd(i) * TAU, b = Math.sqrt(rnd(i + 7)) * .32;
      return [r * Math.cos(2 * t) + Math.cos(a) * b, r * Math.sin(2 * t) + Math.sin(a) * b, -.9 * Math.sin(3 * t) + Math.cos(a + 1) * b];
    },
    wave: i => { const g = Math.ceil(Math.sqrt(N)), ix = i % g, iz = Math.floor(i / g), x = (ix / g - .5) * 10, z = (iz / g - .5) * 10; return [x, .5 * Math.sin(x * 1.1) * Math.cos(z * .9), z]; },
    helix: i => {
      const k = i % 4, y = (rnd(i + 3) - .5) * 7, a = y * 1.6;
      if (k < 2) { const s = k * Math.PI; return [Math.cos(a + s) * 1.3, y, Math.sin(a + s) * 1.3]; }
      const yy = Math.round(y * 2.2) / 2.2, aa = yy * 1.6, m = rnd(i + 11) * 2 - 1;
      return [Math.cos(aa) * 1.3 * m, yy, Math.sin(aa) * 1.3 * m];
    },
    cube: i => {
      const S = 1.7, f = i % 6, u = (rnd(i) * 2 - 1) * S, v = Math.round((rnd(i + 5) * 2 - 1) * 4) / 4 * S;
      const [a, b] = i % 12 < 6 ? [u, v] : [v, u];
      return [[S, a, b], [-S, a, b], [a, S, b], [a, -S, b], [a, b, S], [a, b, -S]][f];
    },
    galaxy: i => {
      const arm = i % 3, r = Math.pow(rnd(i), .6) * 3.4, a = r * 1.7 + arm * TAU / 3 + (rnd(i + 2) - .5) * .5;
      return [Math.cos(a) * r, (rnd(i + 9) - .5) * .35 * (1.2 - r / 3.4), Math.sin(a) * r];
    },
    lorenz: i => lor[i % lor.length],
    torus: i => { const u = rnd(i) * TAU, v = rnd(i + 1) * TAU, R = 2, r = .75; return [(R + r * Math.cos(v)) * Math.cos(u), r * Math.sin(v), (R + r * Math.cos(v)) * Math.sin(u)]; }
  };
  const T = {};
  const target = k => {
    if (!T[k]) { const a = new Float32Array(N * 3), fn = shapes[k] || shapes.sphere; for (let i = 0; i < N; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } T[k] = a; }
    return T[k];
  };

  const secs = [...document.querySelectorAll('[data-shape]')];
  const cfgOf = el => {
    const side = mobile ? 'center' : (el.dataset.side || 'center');
    const shape = el.dataset.shape;
    return {
      el, s: shape, core: el.hasAttribute('data-core'),
      x: side === 'right' ? 2.7 : side === 'left' ? -2.9 : 0,
      y: shape === 'wave' ? -.6 : 0,
      rx: shape === 'wave' ? .55 : shape === 'lorenz' ? .1 : .3,
      o: +(el.dataset.o || .45) * (mobile ? .6 : 1),
      sc: +(el.dataset.sc || (mobile ? .85 : 1))
    };
  };
  const cfgs = secs.map(cfgOf);
  let cur = cfgs[0] || { el: null, s: 'sphere', core: false, x: 0, y: 0, rx: .3, o: .45, sc: 1 };

  const rend = new Float32Array(N * 3), pos = new Float32Array(target(cur.s)), base = new Float32Array(pos), off = new Float32Array(N * 3);
  rend.set(pos);
  const col = new Float32Array(N * 3);
  const c1 = new THREE.Color('#7dd3fc'), c2 = new THREE.Color('#3b82f6'), c4 = new THREE.Color('#6366f1'), c3 = new THREE.Color('#e0f2fe');
  for (let i = 0; i < N; i++) { const t = rnd(i + 3), c = t > .93 ? c3 : t < .5 ? c1.clone().lerp(c2, t * 2) : c2.clone().lerp(c4, (t - .5) * 2); col.set([c.r, c.g, c.b], i * 3); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(rend, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dotC = document.createElement('canvas'); dotC.width = dotC.height = 64;
  const dc = dotC.getContext('2d'), gr = dc.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  dc.fillStyle = gr; dc.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: mobile ? .07 : .06, map: new THREE.CanvasTexture(dotC), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  group.add(new THREE.Points(geo, mat));

  const icoMat = new THREE.LineBasicMaterial({ color: 0x3b9bff, transparent: true, opacity: 0 });
  const ico = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.45, 1)), icoMat);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.08, 128), ringMat);
  ring.rotation.x = 1.25; group.add(ico, ring);

  const coreEl = document.getElementById('core');

  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  function pick() {
    const mid = innerHeight * .5; let c = cfgs[0];
    for (const k of cfgs) if (k.el.getBoundingClientRect().top < mid) c = k;
    if (c && c !== cur) { cur = c; base.set(target(c.s)); }
  }
  addEventListener('scroll', pick, { passive: true }); pick();

  let shock = null;
  addEventListener('click', e => { if (e.target.closest('a,button,input,canvas.toy,.ba')) return; shock = { x: e.clientX / innerWidth * 2 - 1, y: -(e.clientY / innerHeight * 2 - 1), t: 0 }; });

  const v3 = new THREE.Vector3(), dir = new THREE.Vector3(), inv = new THREE.Matrix4();
  const onPlane = (nx, ny) => { v3.set(nx, ny, .5).unproject(camera); dir.copy(v3).sub(camera.position).normalize(); const k = -camera.position.z / dir.z; return [camera.position.x + dir.x * k, camera.position.y + dir.y * k]; };
  let rotY = 0, emx = 0, emy = 0, gx = cur.x, gy = cur.y, grx = cur.rx, gsc = cur.sc, t = 0, coreO = 0;

  function frame() {
    t += .016;
    emx += (M.nx - emx) * .05; emy += (M.ny - emy) * .05;
    gx += (cur.x - gx) * .04; gy += (cur.y - gy) * .04; grx += (cur.rx - grx) * .04; gsc += (cur.sc - gsc) * .04;
    rotY += cur.s === 'lorenz' ? .003 : .0022;
    group.position.set(gx, gy, 0);
    group.rotation.set(grx - emy * .35, rotY + emx * .6, 0);
    group.scale.setScalar(gsc);
    const ci = cur.core ? 1 : 0;
    mat.opacity += (cur.o - mat.opacity) * .05;
    icoMat.opacity += (ci * .14 - icoMat.opacity) * .05;
    ringMat.opacity += (ci * .25 - ringMat.opacity) * .05;
    ico.rotation.y += .001;
    group.updateMatrixWorld();

    // the logo sits at the centre of the shape
    if (coreEl) {
      coreO += (ci - coreO) * .08;
      v3.copy(group.position).project(camera);
      const x = (v3.x + 1) / 2 * innerWidth, y = (1 - v3.y) / 2 * innerHeight;
      coreEl.style.transform = `translate(${x}px,${y}px) scale(${(.6 + coreO * .4) * gsc})`;
      coreEl.style.opacity = coreO;
      coreEl.classList.toggle('on', coreO > .5);
    }

    const [mx, my] = onPlane(M.nx, M.ny);
    const e = group.matrixWorld.elements; inv.copy(group.matrixWorld).invert(); const ie = inv.elements;
    const cz = camera.position.z, R2 = 2.56, act = M.active && fine;
    let sx = 0, sy = 0, sr = 0;
    if (shock) { shock.t += .016; [sx, sy] = onPlane(shock.x, shock.y); sr = shock.t * 9; if (shock.t > .9) shock = null; }

    for (let i = 0; i < N; i++) {
      const j = i * 3;
      pos[j] += (base[j] - pos[j]) * .045; pos[j + 1] += (base[j + 1] - pos[j + 1]) * .045; pos[j + 2] += (base[j + 2] - pos[j + 2]) * .045;
      if (act || shock) {
        const lx = pos[j] + off[j], ly = pos[j + 1] + off[j + 1], lz = pos[j + 2] + off[j + 2];
        const wx = e[0] * lx + e[4] * ly + e[8] * lz + e[12], wy = e[1] * lx + e[5] * ly + e[9] * lz + e[13], wz = e[2] * lx + e[6] * ly + e[10] * lz + e[14];
        const f = cz / (cz - wz), px = wx * f, py = wy * f;
        let vx = 0, vy = 0;
        if (act) {
          const dx = px - mx, dy = py - my, d2 = dx * dx + dy * dy;
          if (d2 < R2) { const d = Math.sqrt(d2) + 1e-4, k = (1 - d2 / R2) * .09; vx += dx / d * k; vy += dy / d * k; }
        }
        if (shock) {
          const dx = px - sx, dy = py - sy, d = Math.sqrt(dx * dx + dy * dy) + 1e-4, band = Math.abs(d - sr);
          if (band < .8) { const k = (1 - band / .8) * .35 * (1 - shock.t); vx += dx / d * k; vy += dy / d * k; }
        }
        off[j] += ie[0] * vx + ie[4] * vy; off[j + 1] += ie[1] * vx + ie[5] * vy; off[j + 2] += ie[2] * vx + ie[6] * vy;
      }
      off[j] *= .93; off[j + 1] *= .93; off[j + 2] *= .93;
      const w = Math.sin(t * 1.3 + i * .37) * .025;
      rend[j] = pos[j] + off[j] + w; rend[j + 1] = pos[j + 1] + off[j + 1] + w; rend[j + 2] = pos[j + 2] + off[j + 2];
    }
    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  if (reduce) {
    const still = () => { pos.set(base); mat.opacity = cur.o; frame(); };
    still(); addEventListener('scroll', still, { passive: true }); return;
  }
  (function loop() { if (!document.hidden) frame(); requestAnimationFrame(loop); })();
})();
