/* ATAEON Cognition — shared header/footer, page transitions, content rendering and interactions */
(function () {
  const S = window.SITE || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page || '';

  /* ---------- header, footer, background layers ---------- */
  const nav = [['research', 'Research'], ['products', 'Products'], ['solutions', 'Solutions'], ['company', 'Company']];
  document.body.insertAdjacentHTML('afterbegin', `
    <canvas id="gl" aria-hidden="true"></canvas><div class="vignette" aria-hidden="true"></div>
    <div id="glow" aria-hidden="true"></div><div id="prog" aria-hidden="true"></div>
    <nav id="nav"><div class="wrap">
      <a href="index.html" class="logo" data-logo="nav" aria-label="ATAEON Cognition home"></a>
      <div class="links" id="links">${nav.map(([k, l]) => `<a href="${k}.html" class="${k === page ? 'active' : ''}">${l}</a>`).join('')}<a href="company.html#contact" class="only-m">Talk to us →</a></div>
      <a href="company.html#contact" class="btn btn-p nav-cta mag">Talk to us →</a>
      <button class="menu" id="menu" aria-label="Open menu">☰</button>
    </div></nav>`);
  const main = $('main');
  main && main.insertAdjacentHTML('afterend', `
    <footer><div class="wrap">
      <div class="foot">
        <div>
          <a href="index.html" class="logo" data-logo="nav" aria-label="ATAEON Cognition home"></a>
          <p>Registered office: PN 493, South City, Tisgaon, CIDCO Mahanagar-2, Bajaj Nagar, MIDC Waluj, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra 431136, India.</p>
        </div>
        <div><h4>Explore</h4><a href="research.html">Research</a><a href="products.html">Products</a><a href="solutions.html">Solutions</a><a href="company.html">Company</a></div>
        <div><h4>Products</h4><a href="products.html#labourvala">LabourVala</a><a href="https://labourvala.com" target="_blank" rel="noopener">labourvala.com ↗</a><a href="products.html#pipeline">In the lab</a></div>
        <div><h4>Connect</h4><a href="mailto:support@ataeoncognition.com">support@ataeoncognition.com</a><a href="mailto:support@labourvala.com">support@labourvala.com</a><a href="https://aadesh24.com" target="_blank" rel="noopener">Founder · aadesh24.com ↗</a></div>
      </div>
      <div class="legal">
        <span>© ${new Date().getFullYear()} ATAEON Cognition Pvt. Ltd. All rights reserved.</span>
        <span class="mono">CIN U62010MR2026PTC478731 · GSTIN 27ABGCA2190P1Z8</span>
      </div>
    </div></footer>`);

  /* ---------- render content from data.js ---------- */
  const R = {
    updates(el) {
      const n = +el.dataset.limit || S.updates.length;
      el.innerHTML = S.updates.slice(0, n).map((u, i) => `
        <article class="card tilt reveal d${i % 4}">
          <div class="when"><span>${u.when}</span><span class="pill ${u.upcoming ? 'soon' : ''}">${u.tag}</span></div>
          <h3>${u.title}</h3><p>${u.text}</p>
        </article>`).join('');
    },
    timeline(el) {
      el.innerHTML = S.updates.map(u => `
        <div class="tl reveal ${u.upcoming ? 'up' : ''}">
          <div class="when">${u.when} <span class="pill ${u.upcoming ? 'soon' : ''}">${u.tag}</span></div>
          <h3>${u.title}</h3><p>${u.text}</p>
        </div>`).join('');
    },
    research(el) {
      el.innerHTML = S.research.map((r, i) => `
        <article class="card tilt reveal d${i % 3}" data-area="${r.area}">
          <span class="num">${r.area}</span>
          <div class="ico">${r.icon}</div>
          <h3>${r.title}</h3><p>${r.text}</p>
          <div class="chips"><span class="pill ${r.status === 'Active' ? 'live' : 'lab'}">● ${r.status}</span>${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </article>`).join('');
    },
    papers(el) {
      el.innerHTML = S.papers.length
        ? S.papers.map(p => `<a class="card tilt reveal" href="${p.url}" target="_blank" rel="noopener"><div class="when mono d">${p.year} · ${p.venue}</div><h3>${p.title}</h3><span class="pill">${p.area}</span><span class="more">Read <i>→</i></span></a>`).join('')
        : `<div class="empty reveal" style="grid-column:1/-1"><b style="color:var(--text);font-size:18px">Our first papers and technical notes are on the way.</b><br>Researchers and students who want to collaborate: <a class="grad" href="mailto:${S.email}">${S.email}</a></div>`;
    },
    pipeline(el) {
      el.innerHTML = S.pipeline.map((p, i) => `
        <article class="card tilt reveal d${i % 3}">
          <span class="pill ${p.kind}">● ${p.status}</span>
          <h3 style="margin-top:18px;font-size:24px">${p.name}</h3><p>${p.text}</p>
        </article>`).join('');
    }
  };
  $$('[data-render]').forEach(el => R[el.dataset.render] && R[el.dataset.render](el));

  /* filters (research) */
  $$('[data-filter-for]').forEach(bar => {
    const grid = $(bar.dataset.filterFor);
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', bar).forEach(x => x.classList.toggle('on', x === b));
      $$('[data-area]', grid).forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.area !== b.dataset.f));
    });
  });

  /* ---------- page transitions ---------- */
  requestAnimationFrame(() => document.body.classList.add('ready'));
  addEventListener('pageshow', () => { document.body.classList.remove('leaving'); document.body.classList.add('ready'); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname) return; // same page anchors scroll normally
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(() => location.href = url.href, 230);
  });

  /* ---------- nav, menu, progress ---------- */
  const menu = $('#menu'), links = $('#links');
  menu.onclick = () => { const o = links.classList.toggle('open'); menu.textContent = o ? '✕' : '☰'; menu.setAttribute('aria-expanded', o); };
  links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); menu.textContent = '☰'; } });
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    $('#prog').style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    $('#nav').classList.toggle('solid', scrollY > 30);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- reveal + counters ---------- */
  function countUp(el) {
    const to = +el.dataset.count, t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    $$('[data-count]', e.target).forEach(countUp);
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- cursor glow, tilt cards, magnetic buttons ---------- */
  window.MOUSE = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false };
  addEventListener('pointermove', e => {
    Object.assign(MOUSE, { x: e.clientX, y: e.clientY, active: true, nx: e.clientX / innerWidth * 2 - 1, ny: -(e.clientY / innerHeight * 2 - 1) });
  }, { passive: true });
  document.addEventListener('pointerleave', () => MOUSE.active = false);
  if (fine && !reduce) {
    const g = $('#glow'); let gx = MOUSE.x, gy = MOUSE.y;
    (function loop() { gx += (MOUSE.x - gx) * .12; gy += (MOUSE.y - gy) * .12; g.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); })();
    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
        c.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => c.style.transform = '');
    });
    $$('.mag').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* ---------- rotating headline word: <span class="grad" data-scramble data-words="a|b|c"> ---------- */
  // Every word sits in the same grid cell, so the box is sized for the longest one and nothing around it moves.
  $$('[data-scramble]').forEach(el => {
    const words = el.dataset.words.split('|');
    el.classList.remove('grad'); el.classList.add('rotator');
    el.innerHTML = words.map((w, i) => `<span class="rw grad${i ? '' : ' on'}"${i ? ' aria-hidden="true"' : ''}>${w}</span>`).join('');
    if (reduce || words.length < 2) return;
    const items = $$('.rw', el); let i = 0;
    setInterval(() => {
      const prev = items[i]; i = (i + 1) % items.length; const next = items[i];
      prev.classList.remove('on'); prev.classList.add('out'); prev.setAttribute('aria-hidden', 'true');
      next.classList.remove('out'); next.classList.add('on'); next.removeAttribute('aria-hidden');
      setTimeout(() => prev.classList.remove('out'), 750);
    }, 3200);
  });

  /* ---------- before / after slider ---------- */
  // Desktop: drag the handle. Phone: tap "today" / "with labourvala" (dragging would block page scrolling).
  const phone = matchMedia('(max-width: 680px)');
  $$('.ba').forEach(ba => {
    const r = $('input', ba), set = v => ba.style.setProperty('--p', v + '%');
    const labels = ba.nextElementSibling && ba.nextElementSibling.classList.contains('ba-labels') ? ba.nextElementSibling : null;
    let btns = [];
    if (labels) {
      labels.innerHTML = '<button type="button" data-v="100">← today</button><button type="button" data-v="0">with labourvala →</button>';
      btns = $$('button', labels);
    }
    const mark = v => btns.forEach(b => b.classList.toggle('on', +b.dataset.v === v));
    const go = v => { r.dataset.touched = 1; ba.classList.add('anim'); set(v); r.value = v; mark(v); setTimeout(() => ba.classList.remove('anim'), 750); };
    btns.forEach(b => b.addEventListener('click', () => go(+b.dataset.v)));
    r.addEventListener('input', () => { set(r.value); r.dataset.touched = 1; mark(-1); });
    if (phone.matches) { set(100); mark(100); }
    if (reduce) return;
    const sw = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; sw.disconnect();
      if (phone.matches) { setTimeout(() => { if (!r.dataset.touched) go(0); }, 1200); return; }
      const t0 = performance.now();
      (function f(t) {
        if (r.dataset.touched) return;
        const k = (t - t0) / 2600; if (k > 1) { r.value = 50; set(50); return; }
        const v = 50 + Math.sin(k * Math.PI * 2) * 35; r.value = v; set(v); requestAnimationFrame(f);
      })(t0);
    }, { threshold: .4 });
    sw.observe(ba);
  });

  /* ---------- live flow stepper ---------- */
  $$('[data-stepper]').forEach(f => {
    const nodes = $$('.node', f); let i = 0;
    nodes[0] && nodes[0].classList.add('on');
    nodes.forEach((n, k) => n.addEventListener('pointerenter', () => { i = k; nodes.forEach(x => x.classList.toggle('on', x === n)); }));
    if (!reduce) setInterval(() => { i = (i + 1) % nodes.length; nodes.forEach((x, k) => x.classList.toggle('on', k === i)); }, 1700);
  });

  /* ---------- terminal ---------- */
  $$('[data-term]').forEach(term => {
    const lines = S.terminal || [];
    if (reduce) { term.innerHTML = lines.join('\n'); return; }
    const to = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; to.disconnect();
      let i = 0;
      (function next() {
        term.innerHTML = lines.slice(0, i).join('\n') + (i < lines.length ? '\n' : ' ') + '<span class="cursor"></span>';
        if (i++ < lines.length) setTimeout(next, 380);
      })();
    }, { threshold: .3 });
    to.observe(term);
  });

  /* ---------- launch countdown ---------- */
  $$('[data-countdown]').forEach(cd => {
    const launch = new Date(S.launch).getTime();
    cd.innerHTML = ['Days', 'Hours', 'Mins', 'Secs'].map(l => `<div><b>--</b><span>${l}</span></div>`).join('');
    const b = $$('b', cd);
    function tick() {
      const ms = launch - Date.now();
      if (ms <= 0) { cd.innerHTML = '<div><b class="grad">LIVE</b><span>Now available</span></div>'; return; }
      const v = [Math.floor(ms / 864e5), Math.floor(ms / 36e5 % 24), Math.floor(ms / 6e4 % 60), Math.floor(ms / 1e3 % 60)];
      v.forEach((x, k) => b[k].textContent = k ? String(x).padStart(2, '0') : x);
      setTimeout(tick, 1000);
    }
    tick();
  });
})();
