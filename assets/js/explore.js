/* ============================================================
   探索页：多选筛选 + 搜索 + 排序 + 味觉
   ============================================================ */
(function () {
  const D = window.LAIBIN;
  const { $, $$, spotRow, foodRow } = App;

  const state = {
    themes: new Set(),
    counties: new Set(),
    conds: new Set(),
    q: '',
    sort: 'rec',
    foodCounty: 'all'
  };

  /* ---------- 初始化筛选器 ---------- */
  $('#themeFilters').innerHTML = D.THEMES.map(t => `
    <button class="chip chip--dot" type="button" data-theme="${t.id}" aria-pressed="false">
      ${t.name}<span class="chip__count">${D.SPOTS.filter(s => s.themes.includes(t.id)).length}</span>
    </button>`).join('');

  $('#countyFilters').innerHTML = D.COUNTIES.map(c => `
    <button class="chip" type="button" data-county="${c.id}" aria-pressed="false">
      ${c.short}<span class="chip__count">${D.SPOTS.filter(s => s.county === c.id).length}</span>
    </button>`).join('');

  /* ---------- 筛选逻辑 ---------- */
  function matchesSpot(s) {
    if (state.themes.size && !s.themes.some(t => state.themes.has(t))) return false;
    if (state.counties.size && !state.counties.has(s.county)) return false;
    if (state.conds.has('free') && s.price !== 0) return false;
    if (state.conds.has('half') && s.hours > 3) return false;
    if (state.conds.has('fav') && !App.favs.has(s.id)) return false;
    if (state.conds.has('photo') && !s.photo) return false;
    if (state.q) {
      const c = App.countyOf(s.county);
      const hay = [s.name, s.oneLiner, s.desc, c.name, c.short, ...s.tags, ...s.themes.map(t => (D.THEMES.find(x => x.id === t) || {}).name || '')]
        .join(' ').toLowerCase();
      if (!hay.includes(state.q.toLowerCase())) return false;
    }
    return true;
  }

  const SORTERS = {
    rec: (a, b) => b.rating - a.rating,
    price: (a, b) => a.price - b.price,
    time: (a, b) => a.hours - b.hours
  };

  function render() {
    const list = D.SPOTS.filter(matchesSpot).sort(SORTERS[state.sort] || SORTERS.rec);
    $('#count').textContent = list.length;
    $('#results').innerHTML = list.map(spotRow).join('');

    // 摘要
    const bits = [];
    state.themes.forEach(t => bits.push((D.THEMES.find(x => x.id === t) || {}).name));
    state.counties.forEach(c => bits.push(App.countyOf(c).short));
    if (state.conds.has('free')) bits.push('免费');
    if (state.conds.has('half')) bits.push('半天内');
    if (state.conds.has('fav')) bits.push('收藏');
    if (state.q) bits.push(`“${state.q}”`);
    $('#filterSummary').textContent = bits.length ? bits.join(' · ') : '全部';

    // 空状态
    const empty = $('#empty');
    if (!list.length) {
      empty.innerHTML = `<div class="empty">
        <h3>这个组合暂时是空的</h3>
        <p>来宾的点不多，条件叠太满就会撞墙。试着去掉一个，或者清空重来。</p>
        <button class="btn btn--sm" type="button" id="emptyReset">清空筛选</button>
      </div>`;
      $('#emptyReset').addEventListener('click', reset);
    } else {
      empty.innerHTML = '';
    }

    syncUrl();
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.themes.size) p.set('theme', [...state.themes].join(','));
    if (state.counties.size) p.set('county', [...state.counties].join(','));
    if (state.conds.size) p.set('cond', [...state.conds].join(','));
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'rec') p.set('sort', state.sort);
    const spot = new URLSearchParams(location.search).get('spot');
    if (spot) p.set('spot', spot);
    const qs = p.toString();
    try {
      history.replaceState(null, '', (qs ? '?' + qs : location.pathname) + location.hash);
    } catch (err) { /* file:// 下忽略 */ }
  }

  function reset() {
    state.themes.clear();
    state.counties.clear();
    state.conds.clear();
    state.q = '';
    state.sort = 'rec';
    $('#q').value = '';
    $('#qClear').classList.remove('is-on');
    $('#sort').value = 'rec';
    $$('[data-theme], [data-county], [data-cond]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    render();
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', e => {
    const chip = e.target.closest('[data-theme], [data-county], [data-cond]');
    if (!chip) return;
    const btn = chip;
    let set, key, val;
    if (btn.dataset.theme) { set = state.themes; val = btn.dataset.theme; key = 'theme'; }
    else if (btn.dataset.county) { set = state.counties; val = btn.dataset.county; key = 'county'; }
    else if (btn.dataset.cond) { set = state.conds; val = btn.dataset.cond; key = 'cond'; }
    else return;
    if (set.has(val)) set.delete(val); else set.add(val);
    btn.setAttribute('aria-pressed', String(set.has(val)));
    render();
  });

  let debounce;
  $('#q').addEventListener('input', e => {
    state.q = e.target.value.trim();
    $('#qClear').classList.toggle('is-on', !!state.q);
    clearTimeout(debounce);
    debounce = setTimeout(render, 140);
  });
  $('#qClear').addEventListener('click', () => {
    state.q = '';
    $('#q').value = '';
    $('#qClear').classList.remove('is-on');
    $('#q').focus();
    render();
  });
  $('#sort').addEventListener('change', e => {
    state.sort = e.target.value;
    render();
  });
  $('#resetFilters').addEventListener('click', reset);

  // 收藏状态变化后，如果正开着「只看收藏」，需要重算
  document.addEventListener('click', e => {
    if (e.target.closest('[data-fav]') && state.conds.has('fav')) setTimeout(render, 0);
  });

  /* ---------- 味觉 ---------- */
  $('#foodFilters').innerHTML = `<button class="chip" type="button" data-food-county="all" aria-pressed="true">全部</button>` +
    D.COUNTIES.map(c => `<button class="chip" type="button" data-food-county="${c.id}" aria-pressed="false">${c.short}</button>`).join('');

  function renderFood() {
    const list = D.FOODS.filter(f => state.foodCounty === 'all' || f.county === state.foodCounty);
    $('#foodList').innerHTML = list.map(foodRow).join('');
    $$('[data-food-county]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.foodCounty === state.foodCounty)));
  }

  $('#foodFilters').addEventListener('click', e => {
    const b = e.target.closest('[data-food-county]');
    if (!b) return;
    state.foodCounty = b.dataset.foodCounty;
    renderFood();
  });

  /* ---------- 从 URL 还原 ---------- */
  (function initFromUrl() {
    const p = new URLSearchParams(location.search);
    const arr = k => (p.get(k) || '').split(',').filter(Boolean);
    arr('theme').forEach(t => { state.themes.add(t); const b = $(`[data-theme="${t}"]`); if (b) b.setAttribute('aria-pressed', 'true'); });
    arr('county').forEach(c => { state.counties.add(c); const b = $(`[data-county="${c}"]`); if (b) b.setAttribute('aria-pressed', 'true'); });
    arr('cond').forEach(c => { state.conds.add(c); const b = $(`[data-cond="${c}"]`); if (b) b.setAttribute('aria-pressed', 'true'); });
    if (p.get('q')) { state.q = p.get('q'); $('#q').value = state.q; $('#qClear').classList.add('is-on'); }
    if (p.get('sort')) { state.sort = p.get('sort'); $('#sort').value = state.sort; }
  })();

  render();
  renderFood();
})();
