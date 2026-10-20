/* ============================================================
   行程规划：按区县归拢 + 时间轴 + 预算估算
   ============================================================ */
(function () {
  const D = window.LAIBIN;
  const { $, $$, icon, spotOf, countyOf, toast } = App;

  const ROUTE = ['xingbin', 'heshan', 'xincheng', 'xiangzhou', 'wuxuan', 'jinxiu'];
  const MEALS = {
    xingbin: '大湾米粉 / 政和夜市',
    heshan: '芋檬鸭脚',
    xincheng: '忻城肉粽 + 五色糯米饭',
    xiangzhou: '象州米粉 + 芋头糕',
    wuxuan: '红糟酸 + 三里鱼圆',
    jinxiu: '瑶族油茶 + 竹筒鸡'
  };
  const LODGE = {
    xingbin: '住兴宾区，市区百元级酒店多，离夜市近',
    heshan: '住合山市区，第二天北上忻城不远',
    xincheng: '住忻城县城，晚上能逛老街',
    xiangzhou: '住象州温泉度假村，泡完直接睡',
    wuxuan: '住武宣县城，红糟菜馆集中',
    jinxiu: '住金秀县城或山脚民宿，第二天进山省力'
  };
  const CLASSIC = ['shengtang', 'baitai', 'motusi', 'guxiang', 'mine', 'nalu'];
  const PACE = {
    easy: { perDay: 2, maxH: 5, label: '轻松' },
    normal: { perDay: 3, maxH: 7.5, label: '适中' },
    packed: { perDay: 4, maxH: 10, label: '紧凑' }
  };

  const saved = App.trip.get();
  const state = {
    days: [1, 2, 3, 4].includes(saved.days) ? saved.days : 3,
    pace: PACE[saved.pace] ? saved.pace : 'normal',
    spots: Array.isArray(saved.spots) ? saved.spots.filter(id => spotOf(id)) : [],
    tab: 'all'
  };

  function persist() {
    App.trip.set({ days: state.days, pace: state.pace, spots: state.spots });
  }

  /* ---------- 选点列表 ---------- */
  function renderPicks() {
    $('#pickList').innerHTML = ROUTE.map(cid => {
      const c = countyOf(cid);
      const list = D.SPOTS.filter(s => s.county === cid);
      return `<div class="pick-group__name">${c.short}</div>` + list.map(s => `
        <label class="pick">
          <input type="checkbox" value="${s.id}" ${state.spots.includes(s.id) ? 'checked' : ''}>
          <span>${s.name}</span>
          <em>${s.price ? '¥' + s.price : '免费'}</em>
        </label>`).join('');
    }).join('');
    $('#pickCount').textContent = `${state.spots.length} / ${D.SPOTS.length}`;
  }

  function syncChecks() {
    $$('#pickList input').forEach(i => { i.checked = state.spots.includes(i.value); });
    $('#pickCount').textContent = `${state.spots.length} / ${D.SPOTS.length}`;
  }

  /* ---------- 排程 ---------- */
  function buildDays() {
    const p = PACE[state.pace];
    const ordered = state.spots.map(spotOf).filter(Boolean).sort((a, b) => {
      const d = ROUTE.indexOf(a.county) - ROUTE.indexOf(b.county);
      return d !== 0 ? d : b.rating - a.rating;
    });

    const chunks = [[]];
    let h = 0;
    ordered.forEach(s => {
      const use = Math.max(s.hours, 1.2) + 0.6;
      let cur = chunks[chunks.length - 1];
      if ((cur.length >= p.perDay || h + use > p.maxH) && cur.length) {
        chunks.push([]);
        cur = chunks[chunks.length - 1];
        h = 0;
      }
      cur.push(s);
      h += use;
    });

    const filled = chunks.filter(c => c.length);
    const used = filled.slice(0, state.days);
    const overflow = filled.slice(state.days).flat();
    while (used.length < state.days) used.push([]);
    return { days: used, overflow };
  }

  function fmtTime(t) {
    let h = Math.floor(t);
    let m = Math.round((t - h) * 60);
    if (m >= 60) { h += 1; m -= 60; }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function timelineOf(list) {
    let t = 9;
    const items = [];
    list.forEach((s, i) => {
      if (i > 0) {
        t += 0.7;
        // 上一站结束时如果接近饭点，先吃饭（留一小时）
        if (t >= 11.6 && t < 14.3) {
          const mt = Math.max(t, 12.2);
          items.push({ type: 'meal', t: mt, title: '午饭', desc: MEALS[s.county] || '就近解决' });
          t = mt + 1;
        }
      }
      items.push({ type: 'spot', t, s });
      t += Math.max(s.hours, 1.2);
    });
    items.push({
      type: 'rest',
      t: t + 0.3,
      county: list.length ? list[list.length - 1].county : null
    });
    return { items, end: t };
  }

  const money = n => '¥' + n.toLocaleString('zh-CN');

  /* ---------- 渲染行程 ---------- */
  function renderTrip() {
    const wrap = $('#tripBody');
    const { days, overflow } = buildDays();
    const total = state.spots.length;

    $('#tripMeta').textContent = total
      ? `${state.days} 天 · ${total} 个点 · ${PACE[state.pace].label}节奏`
      : '还没选点';

    $('#daysLabel').textContent = `${state.days} 天`;
    $('#paceLabel').textContent = PACE[state.pace].label;
    $$('[data-days]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.days) === state.days)));
    $$('[data-pace]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pace === state.pace)));

    if (!total) {
      wrap.innerHTML = `<div class="empty-trip">
        <h3>先勾几个地方</h3>
        <p>左边是全部 24 个点，按区县分好了。<br>不想挑也行，点「先给我排一条」，先看看经典的走法。</p>
        <button class="btn btn--sm" type="button" id="emptyAuto" style="margin-top:20px">先给我排一条</button>
      </div>`;
      $('#emptyAuto').addEventListener('click', autoPlan);
      return;
    }

    const cards = days.map((list, i) => {
      if (!list.length) {
        return `<div class="day-card" data-day="${i + 1}" ${state.tab !== 'all' && state.tab !== i + 1 ? 'hidden' : ''}>
          <div class="day-card__head"><h3>第 ${i + 1} 天</h3><span>机动</span></div>
          <div class="day-card__body"><div class="timeline">
            <div class="tl-item tl-item--rest"><div class="tl-time">—</div><div class="tl-title">留白</div>
            <div class="tl-desc">这一天先空着。可以睡到自然醒，或者临时加一个附近的点。</div></div>
          </div></div>
        </div>`;
      }
      const counties = [...new Set(list.map(s => countyOf(s.county).short))];
      const tickets = list.reduce((n, s) => n + s.price, 0);
      const { items, end } = timelineOf(list);
      const moneyList = items.filter(x => x.type === 'spot').length;

      const tl = items.map(it => {
        if (it.type === 'spot') {
          const c = countyOf(it.s.county);
          return `<div class="tl-item">
            <div class="tl-time">${fmtTime(it.t)}</div>
            <div class="tl-title">${it.s.name}</div>
            <div class="tl-desc">${c.short} · ${it.s.duration} · ${it.s.ticket}</div>
            <button class="tl-link" type="button" data-open="${it.s.id}">看详情</button>
          </div>`;
        }
        if (it.type === 'meal') {
          return `<div class="tl-item tl-item--meal">
            <div class="tl-time">${fmtTime(it.t)}</div>
            <div class="tl-title">${it.title}</div>
            <div class="tl-desc">${it.desc}</div>
          </div>`;
        }
        return `<div class="tl-item tl-item--rest">
          <div class="tl-time">${fmtTime(it.t)}</div>
          <div class="tl-title">收工</div>
          <div class="tl-desc">${LODGE[list[list.length - 1].county]}</div>
        </div>`;
      }).join('');

      return `<div class="day-card" data-day="${i + 1}" ${state.tab !== 'all' && state.tab !== i + 1 ? 'hidden' : ''}>
        <div class="day-card__head">
          <h3>第 ${i + 1} 天 · ${counties.join(' → ')}</h3>
          <span>${moneyList} 个点 · 约 ${Math.round(end - 9)} 小时 · 门票 ${tickets ? money(tickets) : '免费'}</span>
        </div>
        <div class="day-card__body"><div class="timeline">${tl}</div></div>
      </div>`;
    }).join('');

    const tickets = state.spots.reduce((n, id) => n + (spotOf(id).price || 0), 0);
    const meals = 70 * state.days;
    const lodge = 200 * Math.max(0, state.days - 1);
    const transit = 120 * state.days;
    const sum = tickets + meals + lodge + transit;

    wrap.innerHTML = `
      ${overflow.length ? `<div class="notice" style="margin-bottom:18px">
        <strong>装不下了</strong>
        <span>还有 ${overflow.length} 个点（${overflow.map(s => s.name).join('、')}）排不进 ${state.days} 天。加一天，或者把节奏调紧一点。</span>
      </div>` : ''}
      <div class="day-tabs" role="tablist" aria-label="切换天数">
        <button class="day-tab" type="button" role="tab" data-tab="all" aria-selected="${state.tab === 'all'}">全部</button>
        ${days.map((l, i) => `<button class="day-tab" type="button" role="tab" data-tab="${i + 1}" aria-selected="${state.tab === i + 1}">第 ${i + 1} 天</button>`).join('')}
      </div>
      <div style="display:grid;gap:16px">${cards}</div>
      <div class="summary">
        <h3>预算与落脚</h3>
        <div class="budget-row"><span>门票 · ${state.spots.length} 个点</span><b>${money(tickets)}</b></div>
        <div class="budget-row"><span>餐饮 · 70 元/天 × ${state.days}</span><b>${money(meals)}</b></div>
        <div class="budget-row"><span>住宿 · 200 元/晚 × ${Math.max(0, state.days - 1)}</span><b>${money(lodge)}</b></div>
        <div class="budget-row"><span>市内交通 · 120 元/天 × ${state.days}</span><b>${money(transit)}</b></div>
        <div class="budget-total"><span>人均估算（不含往返大交通）</span><strong>${money(sum)}</strong></div>
        <p class="small muted" style="margin-top:14px">门票按成人首道门票估算，索道、游船、体验项目另计。住宿按双人分摊的单人间价位粗算，旺季会上浮。</p>
      </div>`;

    $('#emptyAuto') && $('#emptyAuto').remove();
    bindTabs();
  }

  function bindTabs() {
    $$('[data-tab]').forEach(b => {
      b.addEventListener('click', () => {
        state.tab = b.dataset.tab === 'all' ? 'all' : Number(b.dataset.tab);
        $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
        $$('.day-card').forEach(card => {
          card.hidden = !(state.tab === 'all' || Number(card.dataset.day) === state.tab);
        });
      });
    });
  }

  /* ---------- 操作 ---------- */
  function autoPlan() {
    if (!state.spots.length) {
      const n = Math.min(CLASSIC.length, state.days * 2 + 1);
      state.spots = CLASSIC.slice(0, n);
      syncChecks();
      toast('先按经典路线排了一条，随时改');
    }
    state.tab = 'all';
    persist();
    renderTrip();
  }

  $('#pickList').addEventListener('change', e => {
    const cb = e.target.closest('input[type="checkbox"]');
    if (!cb) return;
    if (cb.checked) {
      if (!state.spots.includes(cb.value)) state.spots.push(cb.value);
    } else {
      state.spots = state.spots.filter(id => id !== cb.value);
    }
    $('#pickCount').textContent = `${state.spots.length} / ${D.SPOTS.length}`;
    persist();
    renderTrip();
  });

  $('#daysSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-days]');
    if (!b) return;
    state.days = Number(b.dataset.days);
    state.tab = 'all';
    persist();
    renderTrip();
  });

  $('#paceSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-pace]');
    if (!b) return;
    state.pace = b.dataset.pace;
    persist();
    renderTrip();
  });

  $('#autoPlan').addEventListener('click', autoPlan);

  $('#clearPicks').addEventListener('click', () => {
    state.spots = [];
    state.tab = 'all';
    syncChecks();
    persist();
    renderTrip();
  });

  $('#printTrip').addEventListener('click', () => {
    if (!state.spots.length) { toast('先选几个点再打印'); return; }
    $$('.day-card').forEach(c => { c.hidden = false; });
    state.tab = 'all';
    $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.tab === 'all')));
    window.print();
  });

  $('#copyTrip').addEventListener('click', async () => {
    if (!state.spots.length) { toast('还没有行程可以复制'); return; }
    const { days } = buildDays();
    const lines = [`来宾 ${state.days} 天行程 · ${PACE[state.pace].label}节奏`, ''];
    days.forEach((list, i) => {
      lines.push(`第 ${i + 1} 天`);
      if (!list.length) { lines.push('  留白'); }
      list.forEach(s => lines.push(`  · ${s.name}（${countyOf(s.county).short}）${s.ticket} / ${s.duration}`));
      lines.push('');
    });
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast('行程已复制');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('行程已复制');
    }
  });

  /* ---------- 启动 ---------- */
  renderPicks();
  renderTrip();
})();
