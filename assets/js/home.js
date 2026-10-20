/* ============================================================
   首页装配：特写 / 清单 / 地图 / 时令 / 味觉 / 贴士
   ============================================================ */
(function () {
  const D = window.LAIBIN;
  const { $, $$, spotRow, spotFeature, foodRow, blobPath, themeName } = App;

  /* ---------- 四处特写 ---------- */
  const FEATURED = [
    ['shengtang', '十月 · 云海'],
    ['baitai', '秋瀑 · 水量还足'],
    ['motusi', '秋阳 · 古建'],
    ['panwangjie', '索道 · 免爬山']
  ];
  $('#featured').innerHTML = FEATURED
    .map(([id, label]) => spotFeature(App.spotOf(id), label))
    .join('');

  /* ---------- 全部清单 ---------- */
  const bar = $('#themeBar');
  const list = $('#allList');
  let activeTheme = 'all';

  bar.innerHTML = `<button class="chip" type="button" data-theme="all" aria-pressed="true">全部<span class="chip__count">${D.SPOTS.length}</span></button>` +
    D.THEMES.map(t => {
      const n = D.SPOTS.filter(s => s.themes.includes(t.id)).length;
      return `<button class="chip" type="button" data-theme="${t.id}" aria-pressed="false">${t.name}<span class="chip__count">${n}</span></button>`;
    }).join('');

  function renderList() {
    const rows = D.SPOTS
      .filter(s => activeTheme === 'all' || s.themes.includes(activeTheme))
      .slice()
      .sort((a, b) => (b.photo ? 1 : 0) - (a.photo ? 1 : 0) || b.rating - a.rating);
    list.innerHTML = rows.map(spotRow).join('');
  }

  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-theme]');
    if (!b) return;
    activeTheme = b.dataset.theme;
    $$('[data-theme]', bar).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderList();
  });

  renderList();

  /* ---------- 地图 ---------- */
  const stage = $('#mapStage');
  const panel = $('#mapPanel');
  const ORDER = ['xincheng', 'heshan', 'xiangzhou', 'jinxiu', 'wuxuan', 'xingbin'];
  const TINT = {
    xincheng: '#E8DCC6', heshan: '#DFDACC', xiangzhou: '#EAE2C7',
    jinxiu: '#D4E0D3', wuxuan: '#D5E2E2', xingbin: '#DCE5D8'
  };

  function mapSvg() {
    const shapes = ORDER.map(id => {
      const c = D.COUNTIES.find(x => x.id === id);
      return `<g class="county" data-county="${id}" tabindex="0" role="button"
        aria-label="${c.name}，${c.tagline}">
        <path class="county__shape" d="${blobPath(c.cx, c.cy, c.rx, c.ry, c.seed)}"
          fill="${TINT[id]}" stroke="#FBF9F4" stroke-width="4"/>
        <text class="county__name" x="${c.cx}" y="${c.cy + 6}" text-anchor="middle">${c.short}</text>
      </g>`;
    }).join('');

    return `<svg viewBox="0 40 720 512" role="img" aria-label="来宾市区县示意图">
      ${shapes}
      <g opacity=".9">
        <path d="M24 262 C 148 302 244 340 342 324 C 446 308 548 274 696 288"
          fill="none" stroke="#9FC7C3" stroke-width="8" stroke-linecap="round" opacity=".55"/>
        <path d="M24 262 C 148 302 244 340 342 324 C 446 308 548 274 696 288"
          fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      </g>
      <text x="214" y="332" font-size="11" fill="#5F7F73" letter-spacing="2" transform="rotate(13 214 332)">红 水 河</text>
    </svg>`;
  }

  stage.innerHTML = mapSvg() + `<span class="map-legend">示意图 · 非精确行政边界</span>`;

  function setPanel(id) {
    const c = D.COUNTIES.find(x => x.id === id);
    if (!c) return;
    const spots = D.SPOTS.filter(s => s.county === id);
    panel.innerHTML = `
      <div class="map-panel__county">广西 · 来宾 · ${c.name}</div>
      <h3>${c.short}</h3>
      <div class="map-panel__tagline">${c.tagline}</div>
      <p>${c.intro}</p>
      <div class="map-panel__list">
        ${spots.slice(0, 5).map(s => `<button type="button" data-open="${s.id}">${s.name}</button>`).join('')}
      </div>
      <div class="small muted" style="margin-top:14px">共 ${spots.length} 处 · 免费 ${spots.filter(s => s.price === 0).length} 处</div>`;
    $$('.county', stage).forEach(g => g.classList.toggle('is-active', g.dataset.county === id));
  }

  stage.addEventListener('mouseover', e => {
    const g = e.target.closest('.county');
    if (g) setPanel(g.dataset.county);
  });
  stage.addEventListener('focusin', e => {
    const g = e.target.closest('.county');
    if (g) setPanel(g.dataset.county);
  });
  stage.addEventListener('click', e => {
    const g = e.target.closest('.county');
    if (g) location.href = `explore.html?county=${g.dataset.county}`;
  });
  stage.addEventListener('keydown', e => {
    const g = e.target.closest('.county');
    if (g && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      location.href = `explore.html?county=${g.dataset.county}`;
    }
  });
  setPanel('xingbin');

  /* ---------- 月份 ---------- */
  const monthsEl = $('#months');
  const detailEl = $('#monthDetail');
  const thisMonth = new Date().getMonth() + 1;
  let curMonth = thisMonth;

  monthsEl.innerHTML = D.MONTHS.map(m => `
    <button class="month-btn" type="button" data-month="${m.m}" aria-pressed="${m.m === curMonth}">
      <span>${String(m.m).padStart(2, '0')}</span><span>月</span>
    </button>`).join('');

  function renderMonth(m) {
    const data = D.MONTHS.find(x => x.m === m);
    detailEl.innerHTML = `
      <div>
        <div class="month-detail__num">${String(m).padStart(2, '0')}</div>
        <h3>${data.title}</h3>
        <p>${data.text}</p>
        <p class="small muted" style="margin-top:12px">${m === thisMonth ? '现在正是这个月。' : ''}</p>
      </div>
      <div class="month-picks">
        ${data.picks.map(id => {
          const s = App.spotOf(id);
          if (!s) return '';
          const art = s.photo
            ? `<span class="month-pick__art"><img src="${s.photo}" alt=""></span>`
            : `<span class="month-pick__art spot-row__thumb--none" style="display:grid;place-items:center;font-family:var(--font-serif);color:var(--rule-strong)">${App.countyOf(s.county).short.slice(0,1)}</span>`;
          return `<button class="month-pick" type="button" data-open="${s.id}">
            ${art}
            <span>
              <h4>${s.name}</h4>
              <p>${App.countyOf(s.county).short} · ${s.priceLine}</p>
            </span>
          </button>`;
        }).join('')}
      </div>`;
    $$('.month-btn', monthsEl).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.month) === m)));
  }

  monthsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-month]');
    if (!b) return;
    curMonth = Number(b.dataset.month);
    renderMonth(curMonth);
  });

  renderMonth(curMonth);

  /* ---------- 味觉 ---------- */
  $('#foodList').innerHTML = D.FOODS.map(foodRow).join('');

  /* ---------- 贴士 ---------- */
  $('#tips').innerHTML = D.TRIP_TIPS.map(t => `
    <div class="tip">
      <div class="tip__k">${t.k}</div>
      <p>${t.v}</p>
      <em>${t.note}</em>
    </div>`).join('');

  App.initReveal();
})();
