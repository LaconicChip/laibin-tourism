/* ============================================================
   公共交互层：导航 / 列表行 / 特写卡 / 详情抽屉 / 收藏 / 行程存储
   ============================================================ */
(function () {
  const D = window.LAIBIN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const icon = (n, s = 16) => Scene.icon(n, s);

  const countyOf = id => D.COUNTIES.find(c => c.id === id) || { short: '', name: '' };
  const spotOf = id => D.SPOTS.find(s => s.id === id);
  const foodOf = id => D.FOODS.find(s => s.id === id);
  const themeName = id => (D.THEMES.find(t => t.id === id) || {}).name || '';

  /* ---------- 本地存储 ---------- */
  const KEY_FAV = 'laibin.favs.v1';
  const KEY_TRIP = 'laibin.trip.v1';

  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式忽略 */ }
  }

  const favs = {
    list: () => read(KEY_FAV, []),
    has: id => favs.list().includes(id),
    toggle(id) {
      const l = favs.list();
      const i = l.indexOf(id);
      if (i > -1) l.splice(i, 1); else l.push(id);
      write(KEY_FAV, l);
      return i === -1;
    }
  };

  const trip = {
    get: () => read(KEY_TRIP, { days: 3, pace: 'normal', spots: [] }),
    set: v => write(KEY_TRIP, v),
    add(id) {
      const t = trip.get();
      if (!t.spots.includes(id)) { t.spots.push(id); trip.set(t); return true; }
      return false;
    },
    remove(id) {
      const t = trip.get();
      t.spots = t.spots.filter(x => x !== id);
      trip.set(t);
    },
    has: id => trip.get().spots.includes(id)
  };

  /* ---------- 提示 ---------- */
  let toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  }

  /* ---------- 列表行 ---------- */
  function spotRow(s) {
    const c = countyOf(s.county);
    const thumb = s.photo
      ? `<img class="spot-row__thumb" src="${s.photo}" alt="${s.name}" decoding="async">`
      : `<span class="spot-row__thumb spot-row__thumb--none" aria-hidden="true">${c.short.slice(0, 1)}</span>`;
    const free = s.price === 0;
    return `<button class="spot-row ${free ? 'spot-row--free' : ''}" type="button" data-open="${s.id}">
      ${thumb}
      <span class="spot-row__main">
        <span class="spot-row__name">${s.name}<em>${c.short} · ${themeName(s.themes[0])}</em></span>
        <span class="spot-row__line">${s.oneLiner}</span>
      </span>
      <span class="spot-row__data">
        <span>${s.duration}</span>
        <span>${s.hours}</span>
      </span>
      <span class="spot-row__price">${s.priceLine}<small>${s.priceNote || '&nbsp;'}</small></span>
    </button>`;
  }

  /* ---------- 特写卡（有实拍图才用） ---------- */
  function spotFeature(s, label) {
    if (!s || !s.photo) return '';
    const c = countyOf(s.county);
    return `<button class="feature" type="button" data-open="${s.id}">
      <span class="feature__media">
        <img src="${s.photo}" alt="${s.name}实景" decoding="async">
        ${label ? `<span class="feature__label">${label}</span>` : ''}
      </span>
      <span class="feature__body">
        <span class="feature__top">
          <span class="feature__name">${s.name}</span>
          <span class="feature__price">${s.priceLine}</span>
        </span>
        <span class="feature__line">${s.oneLiner}</span>
        <span class="feature__meta"><span>${c.short}</span><span>${s.duration}</span><span>${s.hours}</span></span>
        <span class="feature__go">看详情${icon('arrow', 14)}</span>
      </span>
    </button>`;
  }

  function foodRow(f) {
    const c = countyOf(f.county);
    return `<button class="food-row" type="button" data-food="${f.id}">
      <span class="food-row__name">${f.name}<em>${c.short}</em></span>
      <span class="food-row__desc">${f.oneLiner}</span>
      <span class="food-row__price">${f.price}</span>
    </button>`;
  }

  /* ---------- 收藏 ---------- */
  document.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (!fav) return;
    e.preventDefault();
    e.stopPropagation();
    const id = fav.dataset.fav;
    const added = favs.toggle(id);
    $$(`[data-fav="${id}"]`).forEach(b => {
      b.setAttribute('aria-pressed', String(added));
      b.setAttribute('aria-label', `${added ? '取消收藏' : '收藏'}${(spotOf(id) || foodOf(id) || {}).name || ''}`);
    });
    toast(added ? '已收进清单' : '已从清单移除');
  });

  /* ---------- 详情抽屉 ---------- */
  let drawer, scrim, lastFocus;

  function buildDrawer() {
    scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.addEventListener('click', closeDrawer);

    drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', '目的地详情');
    drawer.innerHTML = `
      <div class="drawer__bar">
        <span class="drawer__eyebrow" data-drawer-eyebrow></span>
        <button class="drawer__close" type="button" aria-label="关闭详情">${icon('close', 15)}</button>
      </div>
      <div class="drawer__scroll">
        <div data-drawer-media></div>
        <div class="drawer__body" data-drawer-body></div>
      </div>`;
    document.body.append(scrim, drawer);
    $('.drawer__close', drawer).addEventListener('click', closeDrawer);

    drawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', drawer)
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function setSpotParam(id) {
    const p = new URLSearchParams(location.search);
    if (id) p.set('spot', id); else p.delete('spot');
    const qs = p.toString();
    try {
      history.replaceState(null, '', (qs ? '?' + qs : location.pathname) + location.hash);
    } catch (e) { /* file:// 下忽略 */ }
  }

  function openDrawer(id) {
    const s = spotOf(id);
    const f = s ? null : foodOf(id);
    if (!s && !f) return;
    if (!drawer) buildDrawer();
    const c = countyOf(s ? s.county : f.county);
    lastFocus = document.activeElement;

    $('[data-drawer-eyebrow]', drawer).textContent = s ? `来宾 · ${c.name}` : `来宾 · 味觉 · ${c.short}`;

    if (s) {
      const extra = (s.gallery && s.gallery.length > 1)
        ? `<div class="drawer__gallery">${s.gallery.slice(1).map(src => `<img src="${src}" alt="${s.name}实景">`).join('')}</div>`
        : '';
      const media = s.photo
        ? `<div class="drawer__media"><img src="${s.photo}" alt="${s.name}实景"></div>
           <div class="drawer__figcaption" style="padding-inline:clamp(18px,3.4vw,28px)">实拍：${s.credit}</div>${extra}`
        : '';
      $('[data-drawer-media]', drawer).innerHTML = media;
      $('[data-drawer-body]', drawer).innerHTML = `
        <h2>${s.name}</h2>
        <p class="drawer__line">${s.oneLiner}</p>
        <dl class="drawer__facts">
          <div class="fact"><dt>门票</dt><dd>${s.priceLine}</dd></div>
          <div class="fact"><dt>开放时间</dt><dd>${s.hours}</dd></div>
          <div class="fact"><dt>建议时长</dt><dd>${s.duration}</dd></div>
          <div class="fact"><dt>最佳时节</dt><dd>${s.best}</dd></div>
        </dl>
        ${s.priceNote ? `<p class="small muted" style="margin-top:8px">票价说明：${s.priceNote}。核对于 2026-10-18，以景区当日公示为准。</p>` : ''}
        <h3>是什么地方</h3>
        <p>${s.desc}</p>
        <h3>别错过</h3>
        <ul>${s.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
        <h3>怎么去</h3>
        <p>${s.transport}</p>
        <h3>一句提醒</h3>
        <p>${s.tips}</p>
        <div class="drawer__actions">
          <button class="btn btn--sm" type="button" data-plan-add="${s.id}">${icon('plus', 15)} 加入行程</button>
          <button class="btn btn--ghost btn--sm" type="button" data-fav="${s.id}" aria-pressed="${favs.has(s.id)}">
            ${icon('heart', 15)} 收藏
          </button>
        </div>`;
    } else {
      $('[data-drawer-media]', drawer).innerHTML = '';
      $('[data-drawer-body]', drawer).innerHTML = `
        <h2>${f.name}</h2>
        <p class="drawer__line">${f.oneLiner}</p>
        <dl class="drawer__facts">
          <div class="fact"><dt>参考价</dt><dd>${f.price}</dd></div>
          <div class="fact"><dt>类别</dt><dd>${f.kind}</dd></div>
          <div class="fact"><dt>所属</dt><dd>${c.name}</dd></div>
          <div class="fact"><dt>在哪儿吃</dt><dd>${f.where}</dd></div>
        </dl>
        <h3>什么味道</h3>
        <p>${f.desc}</p>
        <h3>一句提醒</h3>
        <p>别在景区门口找，往老街和菜市场走两步，味道和价格都会好很多。</p>
        <div class="drawer__actions">
          <button class="btn btn--ghost btn--sm" type="button" data-fav="${f.id}" aria-pressed="${favs.has(f.id)}">
            ${icon('heart', 15)} 收藏
          </button>
        </div>`;
    }

    document.body.style.overflow = 'hidden';
    scrim.classList.add('is-open');
    drawer.classList.add('is-open');
    setSpotParam(id);
    setTimeout(() => $('.drawer__close', drawer).focus(), 60);
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    document.body.style.overflow = '';
    setSpotParam(null);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  document.addEventListener('click', e => {
    const food = e.target.closest('[data-food]');
    if (food) { openDrawer(food.dataset.food); return; }
    const open = e.target.closest('[data-open]');
    if (open) { openDrawer(open.dataset.open); return; }
    const add = e.target.closest('[data-plan-add]');
    if (add) {
      const id = add.dataset.planAdd;
      const added = trip.add(id);
      add.innerHTML = `${icon('check', 15)} ${added ? '已加入' : '已在行程里'}`;
      add.disabled = true;
      toast(added ? '已加入行程' : '这个点已经在行程里了');
    }
  });

  /* ---------- chrome ---------- */
  function initChrome() {
    const toggle = $('.nav__toggle');
    const links = $('.nav__links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.addEventListener('click', e => {
        if (e.target.closest('a')) {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
    const search = $('.nav__search');
    if (search && !search.getAttribute('href')) {
      search.addEventListener('click', () => {
        const q = document.getElementById('q');
        if (q) { q.focus(); q.select(); } else location.href = 'explore.html';
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const q = document.getElementById('q');
      e.preventDefault();
      if (q) { q.focus(); q.select(); } else location.href = 'explore.html';
    });
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- 地图 blob ---------- */
  function blobPath(cx, cy, rx, ry, seed, n = 10) {
    let a = seed * 131 + 7;
    const rnd = () => { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; };
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      const k = 0.86 + rnd() * 0.26;
      pts.push([cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + ' Z';
  }

  window.App = {
    $, $$, icon, countyOf, spotOf, foodOf, themeName,
    spotRow, spotFeature, foodRow, toast, openDrawer, closeDrawer,
    favs, trip, initChrome, initReveal, blobPath
  };

  document.addEventListener('DOMContentLoaded', () => {
    initChrome();
    initReveal();
    const deep = new URLSearchParams(location.search).get('spot');
    if (deep && (spotOf(deep) || foodOf(deep))) setTimeout(() => openDrawer(deep), 120);
  });
})();
