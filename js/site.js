const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
document.documentElement.classList.remove('no-js');
$('#year').textContent = new Date().getFullYear();

/* ---------- hero word: letters rise in ---------- */
$$('[data-split]').forEach(el => {
  const t = el.textContent; el.textContent = '';
  [...t].forEach((c, i) => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = c; el.appendChild(s); });
});
const ready = () => requestAnimationFrame(() => document.body.classList.add('loaded'));
(document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);
setTimeout(ready, 2000);

/* ---------- header + active section ---------- */
const hdr = $('.top'), links = $$('#menu a');
addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 40), { passive: true });
links.forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const id = e.target.id === 'shorts' ? 'ai' : e.target.id;
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

/* ---------- reveals ---------- */
const rv = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); rv.unobserve(e.target);
  $$('[data-count]', e.target).forEach(countUp);
}), { threshold: .12 });
$$('.rv, .mega, .facts').forEach(el => rv.observe(el));
$$('.grid, .services, .pills').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--sd', (i % 3) * .1 + 's')));

function countUp(el) {
  if (el.done || reduce) return; el.done = true;
  const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
  const f = now => {
    const k = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(to * e) + suf;
    if (k < 1) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

/* ---------- hero parallax: photo and lettering drift apart ---------- */
const hero = $('.hero');
if (finePointer && !reduce) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
  });
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); });
}
const introImg = $('.intro-photo img');
if (!reduce && introImg) {
  const tick = () => {
    const r = introImg.parentElement.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) introImg.style.setProperty('--py', ((r.top - innerHeight / 2) * -.08).toFixed(1) + 'px');
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Odoo app screenshot switcher ---------- */
$$('.thumbs').forEach(strip => {
  const img = strip.parentElement.querySelector('.frame img');
  strip.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.classList.contains('on')) return;
    $$('button', strip).forEach(x => x.classList.toggle('on', x === b));
    img.classList.add('swap');
    setTimeout(() => { img.onload = () => img.classList.remove('swap'); img.src = b.dataset.src; }, 220);
  });
});

/* ---------- lightbox: screenshots and shorts ---------- */
const lb = $('#lightbox'), lbImg = $('img', lb), lbVid = $('video', lb);
const openLb = () => { lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open')); };
const closeLb = () => { lb.classList.remove('open'); lbVid.pause(); setTimeout(() => { lb.hidden = true; lbVid.removeAttribute('src'); lbVid.load(); }, 300); };
$$('.frame').forEach(f => f.addEventListener('click', () => {
  const i = $('img', f); lbImg.src = i.src; lbImg.alt = i.alt; lbImg.hidden = false; lbVid.hidden = true; openLb();
}));
$$('.short').forEach(s => {
  s.addEventListener('click', () => {
    lbImg.hidden = true; lbVid.hidden = false; lbVid.src = s.dataset.video; lbVid.muted = false; openLb();
    lbVid.play().catch(() => {});
  });
  if (finePointer && !reduce) {          // silent preview on hover
    let v = null;
    s.addEventListener('pointerenter', () => {
      if (!v) { v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.src = s.dataset.video; s.prepend(v); }
      v.play().catch(() => {});
    });
    s.addEventListener('pointerleave', () => v && v.pause());
  }
});
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-close')) closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

/* ---------- 3D portfolio video plays while on screen ---------- */
const vid = $('.showcase video');
if (vid) new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting && !reduce) vid.play().catch(() => {}); else if (!vid.paused && vid.muted) vid.pause();
}), { threshold: .45 }).observe(vid);

/* ---------- concept design previews: play when hovered, or when on screen on touch devices ---------- */
$$('.concept video').forEach(v => {
  const play = () => { if (!v.getAttribute('src')) v.src = v.dataset.src; v.play().catch(() => {}); };
  if (finePointer) {
    const card = v.closest('.concept');
    card.addEventListener('pointerenter', play);
    card.addEventListener('pointerleave', () => v.pause());
  } else {
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play() : v.pause()), { threshold: .6 }).observe(v);
  }
});
