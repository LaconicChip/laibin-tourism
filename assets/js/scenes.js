/* ============================================================
   插画引擎 —— 全部场景由 SVG 逐层绘制，无外部图片依赖
   风格：低饱和纸感插画，三层山影 + 前景母题 + 细颗粒
   ============================================================ */
(function () {
  const W = 400, H = 300;
  let uid = 0;

  function rand(seed) {
    let a = seed * 9301 + 49297;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const PAL = {
    peak:    { sky: ['#EAF4EE', '#FBF8EF'], far: '#B3CFC1', mid: '#7FA694', near: '#456F5F', ink: '#2B4A3E', sun: '#F3C97C' },
    gorge:   { sky: ['#EFF5EE', '#FBF7ED'], far: '#C6C2AC', mid: '#9A9078', near: '#6B604C', ink: '#3B3527', sun: '#F0C382' },
    lake:    { sky: ['#E6F1F3', '#FBF8F0'], far: '#AFCFCE', mid: '#7BAAA9', near: '#3F7572', ink: '#2A4E4C', sun: '#F2CE8A' },
    forest:  { sky: ['#EDF4E7', '#FBF8EE'], far: '#C2D3B4', mid: '#93B183', near: '#5C7F52', ink: '#2F4230', sun: '#EFCB86' },
    village: { sky: ['#F2EFE4', '#FBF7EC'], far: '#C9CBAD', mid: '#A4A98A', near: '#6E7355', ink: '#3A3B2C', sun: '#EEC27E' },
    hall:    { sky: ['#F5EEE1', '#FCF7EC'], far: '#D3C6AE', mid: '#B09E80', near: '#7A6749', ink: '#3F3423', sun: '#E8B775' },
    museum:  { sky: ['#EDF2EC', '#FBF8F0'], far: '#C3CDBF', mid: '#96A492', near: '#5B6D5C', ink: '#2E3B2F', sun: '#EDC785' },
    cave:    { sky: ['#F0EAD9', '#FBF6E9'], far: '#CDBB9B', mid: '#A98F6C', near: '#705A3E', ink: '#3B2F1E', sun: '#E6BC79' },
    island:  { sky: ['#E7F2F0', '#FBF8EE'], far: '#B2CFC9', mid: '#7FA9A1', near: '#456F66', ink: '#2A4842', sun: '#F2CE8A' },
    waterfront:{ sky:['#EBF3EF', '#FBF8EF'], far: '#BFD2C7', mid: '#8DAEA1', near: '#527566', ink: '#2C4139', sun: '#F0C886' },
    mine:    { sky: ['#EFECE2', '#FBF7EC'], far: '#C9C4B4', mid: '#9E9A8A', near: '#5F6157', ink: '#33352E', sun: '#E9BE80' },
    ridge:   { sky: ['#F8EFDB', '#FCF8EF'], far: '#DCC48F', mid: '#BFA368', near: '#6F7A52', ink: '#3B3D28', sun: '#F0B45F' },
    spring:  { sky: ['#EFF4EC', '#FBF8EF'], far: '#C6D3BE', mid: '#9EB59A', near: '#657F66', ink: '#31432F', sun: '#EDC98B' },
    night:   { sky: ['#232B45', '#4A4A5E'], far: '#3A4059', mid: '#2C3149', near: '#1D2133', ink: '#12141F', sun: '#F6D49A' },
    oldtown: { sky: ['#F1EBDB', '#FBF7EC'], far: '#CFC6AE', mid: '#A89B7D', near: '#6F6350', ink: '#3A3226', sun: '#E9BE7E' },
    field:   { sky: ['#F8F3DE', '#FCF9EF'], far: '#DCD69E', mid: '#C0C47E', near: '#8A9C5C', ink: '#41492C', sun: '#F0C36B' },
    river:   { sky: ['#E9F2EF', '#FBF8EF'], far: '#B6D0C3', mid: '#83AC9B', near: '#4A735F', ink: '#2A4535', sun: '#F1CB85' },
    weave:   { sky: ['#F4EDDF', '#FCF8EE'], far: '#D8CCB2', mid: '#B5A482', near: '#7C6A4C', ink: '#3E3320', sun: '#E9BE7C' },
    bowl:    { sky: ['#F7F1E4', '#FCF8EE'], far: '#E0D0AE', mid: '#C3A97E', near: '#8A7150', ink: '#40331F', sun: '#EABE78' },
    tea:     { sky: ['#F3EEE0', '#FCF8EF'], far: '#D9D3B4', mid: '#B3AF8C', near: '#77805C', ink: '#3A4029', sun: '#E9C07C' },
    jar:     { sky: ['#F3EDE1', '#FCF8EE'], far: '#DAC9AE', mid: '#B79E7C', near: '#7E6748', ink: '#3E3220', sun: '#E8B97A' }
  };

  /* ---------- 基础图形 ---------- */
  function karst(x, base, h, w, fill, op, lean = 0) {
    const hw = w / 2;
    return `<path d="M${x - hw} ${base}
      C ${x - hw * .74 + lean * .25} ${base - h * .16} ${x - hw * .56 + lean * .5} ${base - h * .52} ${x - hw * .40 + lean} ${base - h * .80}
      C ${x - hw * .26 + lean} ${base - h * .97} ${x + hw * .12 + lean} ${base - h * 1.02} ${x + hw * .29} ${base - h * .87}
      C ${x + hw * .50} ${base - h * .66} ${x + hw * .72} ${base - h * .22} ${x + hw} ${base} Z"
      fill="${fill}" opacity="${op}"/>`;
  }

  /* 山簇：两三座高低错落、彼此重叠的峰，避免"一排三角" */
  function cluster(x, base, h, w, n, fill, op, r) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const off = i - (n - 1) / 2;
      const dx = off * w * 0.46 + (r() - .5) * 10;
      const hh = h * (0.66 + r() * 0.52) * (1 - Math.abs(off) * 0.14);
      const shade = op * (0.78 + r() * 0.42);
      out += karst(x + dx, base + (r() * 8 - 4), hh, w * (0.78 + r() * 0.34), fill, Math.min(1, shade), (r() - .5) * 9);
    }
    return out;
  }

  /* 双峰，用来打断"一排三角"的节奏 */
  function twinPeak(x, base, h, w, fill, op) {
    const hw = w / 2;
    return `<path d="M${x - hw} ${base}
      C ${x - hw * .90} ${base - h * .34} ${x - hw * .74} ${base - h * .70} ${x - hw * .58} ${base - h * .82}
      C ${x - hw * .46} ${base - h * .92} ${x - hw * .34} ${base - h * .74} ${x - hw * .26} ${base - h * .58}
      C ${x - hw * .12} ${base - h * .92} ${x + hw * .06} ${base - h * 1.02} ${x + hw * .20} ${base - h * .88}
      C ${x + hw * .46} ${base - h * .68} ${x + hw * .74} ${base - h * .32} ${x + hw} ${base} Z"
      fill="${fill}" opacity="${op}"/>`;
  }

  function hill(y, amp, fill, op) {
    return `<path d="M0 ${y} C 70 ${y - amp} 130 ${y + amp * .45} 200 ${y - amp * .3} C 270 ${y - amp * .9} 330 ${y + amp * .3} 400 ${y - amp * .5} L400 300 L0 300 Z" fill="${fill}" opacity="${op}"/>`;
  }

  function mist(y, h, op, w = 440) {
    return `<rect x="-20" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#FFFFFF" opacity="${op}"/>`;
  }

  function cloud(x, y, s, op) {
    return `<g opacity="${op}" fill="#FFFFFF">
      <ellipse cx="${x}" cy="${y}" rx="${18 * s}" ry="${7 * s}"/>
      <ellipse cx="${x + 14 * s}" cy="${y - 4 * s}" rx="${13 * s}" ry="${8 * s}"/>
      <ellipse cx="${x - 15 * s}" cy="${y - 2 * s}" rx="${11 * s}" ry="${6 * s}"/>
    </g>`;
  }

  function sun(x, y, r, id, color) {
    return `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="url(#glow${id})"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity=".92"/>`;
  }

  function pine(x, base, h, fill, op = 1) {
    const w = h * 0.42;
    return `<g opacity="${op}">
      <rect x="${x - h * .035}" y="${base - h * .28}" width="${h * .07}" height="${h * .28}" fill="${fill}"/>
      <path d="M${x} ${base - h} L${x + w * .5} ${base - h * .55} L${x + w * .22} ${base - h * .55} L${x + w * .62} ${base - h * .26} L${x - w * .62} ${base - h * .26} L${x - w * .22} ${base - h * .55} L${x - w * .5} ${base - h * .55} Z" fill="${fill}"/>
    </g>`;
  }

  function bird(x, y, s, fill, op = .5) {
    return `<path d="M${x} ${y} q ${s} ${-s * .7} ${s * 2} 0 M${x + s * 2} ${y} q ${s} ${-s * .7} ${s * 2} 0" fill="none" stroke="${fill}" stroke-width="1.4" stroke-linecap="round" opacity="${op}"/>`;
  }

  function stiltHouse(x, base, w, h, body, roofC, ink) {
    const roofH = h * .38;
    return `<g>
      <rect x="${x}" y="${base - h + roofH}" width="${w}" height="${h - roofH}" fill="${body}"/>
      <rect x="${x + w * .18}" y="${base - h * .34}" width="${w * .16}" height="${h * .34}" fill="${ink}" opacity=".5"/>
      <rect x="${x + w * .58}" y="${base - h * .34}" width="${w * .18}" height="${h * .34}" fill="${ink}" opacity=".35"/>
      <path d="M${x - w * .12} ${base - h + roofH} L${x + w * .5} ${base - h} L${x + w * 1.12} ${base - h + roofH} Z" fill="${roofC}"/>
      <path d="M${x - w * .12} ${base - h + roofH} q ${w * .1} ${-h * .1} ${w * .2} ${-h * .04}" fill="none" stroke="${roofC}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${x + w * 1.12} ${base - h + roofH} q ${-w * .1} ${-h * .1} ${-w * .2} ${-h * .04}" fill="none" stroke="${roofC}" stroke-width="2" stroke-linecap="round"/>
      <g stroke="${roofC}" stroke-width="1.6" opacity=".55">
        <line x1="${x + w * .12}" y1="${base}" x2="${x + w * .12}" y2="${base - h * .16}"/>
        <line x1="${x + w * .88}" y1="${base}" x2="${x + w * .88}" y2="${base - h * .16}"/>
      </g>
    </g>`;
  }

  function hallBuilding(x, base, w, h, wall, roofC, ink, cols) {
    const roofH = h * .34;
    return `<g>
      <rect x="${x}" y="${base - h + roofH}" width="${w}" height="${h - roofH}" fill="${wall}"/>
      <g fill="${cols}">
        <rect x="${x + w * .10}" y="${base - h + roofH}" width="${w * .07}" height="${h - roofH}"/>
        <rect x="${x + w * .31}" y="${base - h + roofH}" width="${w * .07}" height="${h - roofH}"/>
        <rect x="${x + w * .62}" y="${base - h + roofH}" width="${w * .07}" height="${h - roofH}"/>
        <rect x="${x + w * .83}" y="${base - h + roofH}" width="${w * .07}" height="${h - roofH}"/>
      </g>
      <rect x="${x + w * .18}" y="${base - h + roofH}" width="${w * .62}" height="${h - roofH}" fill="none" stroke="${ink}" stroke-width=".8" opacity=".28"/>
      <path d="M${x - w * .16} ${base - h + roofH} L${x + w * .5} ${base - h} L${x + w * 1.16} ${base - h + roofH} Z" fill="${roofC}"/>
      <path d="M${x - w * .16} ${base - h + roofH} q ${w * .14} ${-h * .16} ${w * .3} ${-h * .07}" fill="none" stroke="${roofC}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M${x + w * 1.16} ${base - h + roofH} q ${-w * .14} ${-h * .16} ${-w * .3} ${-h * .07}" fill="none" stroke="${roofC}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="${x - w * .05}" y="${base - h * .09}" width="${w * 1.1}" height="${h * .09}" fill="${roofC}" opacity=".28"/>
    </g>`;
  }

  function tree(x, base, h, fill, op = 1) {
    return `<g opacity="${op}">
      <rect x="${x - h * .04}" y="${base - h * .32}" width="${h * .08}" height="${h * .32}" fill="${fill}"/>
      <ellipse cx="${x}" cy="${base - h * .55}" rx="${h * .34}" ry="${h * .3}" fill="${fill}"/>
      <ellipse cx="${x - h * .2}" cy="${base - h * .42}" rx="${h * .24}" ry="${h * .2}" fill="${fill}"/>
      <ellipse cx="${x + h * .2}" cy="${base - h * .44}" rx="${h * .22}" ry="${h * .19}" fill="${fill}"/>
    </g>`;
  }

  function bamboo(x, base, h, fill) {
    let out = `<g stroke="${fill}" stroke-width="2.4" stroke-linecap="round" fill="none">`;
    for (let i = 0; i < 3; i++) {
      const dx = i * 7 - 7;
      out += `<path d="M${x + dx} ${base} q ${dx * .5} ${-h * .5} ${dx * .8} ${-h}"/>`;
      out += `<path d="M${x + dx * .6} ${base - h * .55} q ${-10} ${-4} ${-16} ${-2}" stroke-width="1.6"/>`;
      out += `<path d="M${x + dx * .8} ${base - h * .78} q ${10} ${-5} ${15} ${-6}" stroke-width="1.6"/>`;
    }
    return out + '</g>';
  }

  function ground(y, fill, op = 1) {
    return `<path d="M0 ${y} C 60 ${y - 8} 120 ${y + 6} 200 ${y - 2} C 280 ${y - 9} 340 ${y + 7} 400 ${y - 1} L400 300 L0 300 Z" fill="${fill}" opacity="${op}"/>`;
  }

  /* ---------- 场景 ---------- */
  const SCENES = {
    peak(r) {
      const p = PAL.peak;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${cloud(88, 44, 1.2, .5)}${cloud(296, 60, .8, .32)}
        ${sun(306, 50, 15, uid, p.sun)}

        <!-- 远景：三座大小悬殊的峰 -->
        ${karst(118, 250, 196, 168, p.far, .52, -8)}
        ${karst(196, 254, 118, 112, p.far, .4, 5)}
        ${karst(318, 258, 158, 146, p.far, .46, -4)}
        <rect y="150" width="400" height="110" fill="url(#haze${uid})"/>

        <!-- 中景：两座错落的峰，压住画面重心 -->
        ${karst(44, 282, 118, 138, p.mid, .82)}
        ${twinPeak(172, 280, 132, 176, p.mid, .88)}
        ${karst(316, 286, 96, 118, p.mid, .74)}
        ${mist(236, 22, .5)}

        <!-- 近景山脊 -->
        <path d="M0 300 L0 286 C 54 270 106 292 164 280 C 224 268 284 288 344 276 C 366 272 386 278 400 274 L400 300 Z" fill="${p.near}"/>
        ${pine(32, 300, 78, p.ink, .94)}${pine(366, 300, 54, p.ink, .8)}
        <g fill="${p.ink}" opacity=".68">
          <rect x="206" y="280" width="19" height="11"/>
          <path d="M202 280 L216 272 L230 280 Z"/>
          <rect x="234" y="284" width="13" height="8"/>
          <path d="M231 284 L240 278 L250 284 Z"/>
        </g>
        ${bird(92, 86, 4, p.ink, .38)}${bird(124, 72, 3, p.ink, .26)}`;
    },

    gorge(r) {
      const p = PAL.gorge;
      const L = `M0 300 L0 58 L56 66 L74 124 L86 178 L108 232 L134 274 L162 300 Z`;
      const R = `M400 300 L400 46 L340 56 L322 118 L310 174 L286 230 L260 272 L232 300 Z`;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(206, 34, 9, uid, p.sun)}

        <!-- 谷口远山 -->
        ${karst(140, 196, 96, 106, p.far, .42, -4)}
        ${karst(262, 200, 74, 92, p.far, .36, 5)}
        <rect y="120" width="400" height="86" fill="url(#haze${uid})"/>

        <defs>
          <clipPath id="cl${uid}"><path d="${L}"/></clipPath>
          <clipPath id="cr${uid}"><path d="${R}"/></clipPath>
        </defs>
        <path d="${L}" fill="${p.far}"/>
        <path d="${R}" fill="${p.mid}"/>

        <!-- 谷口的远山，压住亮部，让瀑布跳出来 -->
        <g opacity=".9">
          ${karst(150, 236, 84, 120, '#8FA98C', .75, -3)}
          ${karst(252, 240, 64, 104, '#7C9A7E', .7, 4)}
          <path d="M96 300 C 130 254 168 232 200 224 C 236 234 272 258 304 300 Z" fill="#6F8A6C" opacity=".55"/>
        </g>
        <rect y="196" width="400" height="46" fill="url(#haze${uid})" opacity=".5"/>

        <g clip-path="url(#cl${uid})" stroke="${p.ink}" stroke-width="1.2" opacity=".2" fill="none">
          <path d="M-10 104 C 24 114 46 102 88 116"/><path d="M-10 152 C 28 164 50 150 96 168"/>
          <path d="M-10 204 C 30 216 56 200 112 220"/>
        </g>
        <g clip-path="url(#cr${uid})" stroke="${p.ink}" stroke-width="1.2" opacity=".18" fill="none">
          <path d="M410 96 C 372 106 350 92 306 108"/><path d="M410 146 C 368 158 346 142 296 162"/>
          <path d="M410 198 C 366 212 340 194 282 216"/>
        </g>

        <g fill="${p.near}" opacity=".6">
          <path d="M6 58 q 11 -13 22 -2 q 11 -11 22 0 q 9 -6 15 2 z"/>
          <path d="M306 50 q 11 -13 22 -2 q 11 -11 22 0 q 9 -6 15 2 z"/>
          <path d="M52 122 q 8 -10 16 -2 q 8 -8 14 0 z"/>
          <path d="M330 112 q 8 -10 16 -2 q 8 -8 14 0 z"/>
        </g>
        <g stroke="${p.near}" stroke-width="1.6" fill="none" opacity=".45" stroke-linecap="round">
          <path d="M100 228 q -7 12 -3 21"/><path d="M116 258 q -7 10 -4 19"/>
          <path d="M292 224 q 7 12 3 21"/><path d="M276 256 q 7 10 4 19"/>
        </g>

        <!-- 瀑布 -->
        <path d="M196 78 C 201 118 199 152 198 178 C 197 198 196 210 198 222 L206 222 C 204 208 205 196 206 178 C 208 150 207 116 203 78 Z" fill="#E4F0ED" opacity=".95"/>
        <path d="M199 84 C 202 122 200 156 199 184 L202 184 C 203 154 205 120 202 84 Z" fill="#FFFFFF" opacity=".7"/>
        <g fill="#FFFFFF" opacity=".55">
          <circle cx="189" cy="216" r="4"/><circle cx="213" cy="220" r="3.2"/>
        </g>

        <!-- 溪流 -->
        <path d="M0 300 L0 286 C 46 274 92 290 138 282 C 176 276 214 292 252 284 C 296 274 342 290 400 278 L400 300 Z" fill="${p.near}"/>
        <path d="M154 300 C 168 286 184 272 197 264 C 210 274 224 288 236 300 Z" fill="#CFE4E1" opacity=".85"/>
        <g fill="${p.near}">
          <ellipse cx="44" cy="292" rx="24" ry="8"/><ellipse cx="338" cy="296" rx="28" ry="9"/>
          <ellipse cx="104" cy="298" rx="13" ry="5"/>
        </g>
        ${bamboo(24, 300, 82, p.ink)}${bamboo(372, 300, 68, p.ink)}
        <rect y="196" width="400" height="26" fill="url(#haze${uid})" opacity=".55"/>`;
    },

    lake(r) {
      const p = PAL.lake;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(96, 54, 15, uid, p.sun)}
        ${cloud(280, 48, 1, .5)}
        ${[30, 88, 144, 208, 268, 328, 384].map(x => karst(x, 176, 62 + r() * 52, 76, p.far, .55)).join('')}
        ${[60, 130, 200, 270, 340].map(x => karst(x, 190, 48 + r() * 34, 70, p.mid, .7)).join('')}
        <rect y="186" width="400" height="114" fill="#CFE3E2"/>
        <rect y="186" width="400" height="114" fill="url(#water${uid})"/>
        <g opacity=".35" fill="${p.mid}">
          ${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${90 + i * 55}" cy="${204 + (i % 3) * 16}" rx="${26 - i * 2}" ry="3.5"/>`).join('')}
        </g>
        <g opacity=".55" stroke="#FFFFFF" stroke-width="1.6" fill="none">
          <path d="M40 232 q 22 -5 44 0"/><path d="M250 244 q 26 -5 52 0"/><path d="M140 268 q 24 -4 48 0"/>
        </g>
        <g transform="translate(186 226)">
          <path d="M0 12 h 68 l -8 10 h -52 z" fill="#B98A56"/>
          <rect x="8" y="2" width="52" height="10" rx="3" fill="#C79A63"/>
          <rect x="30" y="-8" width="3" height="12" fill="#8A6A42"/>
          <path d="M18 22 q 16 6 32 0 l -4 6 h -24 z" fill="#2E4C49" opacity=".35"/>
        </g>
        ${bamboo(368, 296, 92, p.ink)}
        ${ground(290, p.near, .35)}`;
    },

    forest(r) {
      const p = PAL.forest;
      let trunks = '', canopy = '';
      for (let i = 0; i < 7; i++) {
        const x = 22 + i * 58 + r() * 14;
        const h = 150 + r() * 70;
        trunks += `<rect x="${x}" y="${300 - h}" width="${4 + r() * 3}" height="${h}" fill="${p.near}" opacity=".55"/>`;
        canopy += `<ellipse cx="${x}" cy="${300 - h}" rx="${26 + r() * 16}" ry="${20 + r() * 10}" fill="${p.mid}" opacity=".5"/>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        <path d="M0 300 L0 210 C 60 190 100 214 160 196 C 220 178 280 206 340 190 C 370 182 390 188 400 184 L400 300 Z" fill="${p.far}" opacity=".7"/>
        ${canopy}${trunks}
        <g opacity=".22" stroke="#FFF6D8" stroke-width="10">
          <line x1="120" y1="0" x2="176" y2="300"/><line x1="250" y1="0" x2="300" y2="300"/>
        </g>
        ${ground(258, p.near, .92)}
        ${pine(300, 292, 92, p.ink, .85)}
        <g opacity=".85">
          <ellipse cx="70" cy="272" rx="30" ry="10" fill="${p.ink}" opacity=".18"/>
          <path d="M58 264 q 6 -12 12 0 q 6 -14 12 0" fill="none" stroke="${p.ink}" stroke-width="2.4" stroke-linecap="round"/>
        </g>
        ${bamboo(348, 296, 60, p.ink)}`;
    },

    village(r) {
      const p = PAL.village;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(76, 56, 13, uid, p.sun)}
        ${cloud(300, 60, .9, .45)}
        ${hill(150, 34, p.far, .8)}
        ${hill(178, 24, p.mid, .75)}
        ${mist(186, 14, .35)}
        <g>
          ${stiltHouse(44, 268, 58, 58, '#EADCC2', '#6B5A44', p.ink)}
          ${stiltHouse(112, 262, 66, 66, '#EFE2CA', '#5E4E3A', p.ink)}
          ${stiltHouse(196, 272, 54, 54, '#E7D8BC', '#6B5A44', p.ink)}
        </g>
        <g transform="translate(272 150)">
          <rect x="8" y="46" width="46" height="72" fill="#E3D3B6"/>
          <path d="M-4 48 L31 16 L66 48 Z" fill="#6B5A44"/>
          <path d="M-4 48 q 8 -12 20 -6" fill="none" stroke="#6B5A44" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M66 48 q -8 -12 -20 -6" fill="none" stroke="#6B5A44" stroke-width="2.4" stroke-linecap="round"/>
          <rect x="18" y="60" width="10" height="30" fill="${p.ink}" opacity=".35"/>
          <rect x="36" y="60" width="10" height="30" fill="${p.ink}" opacity=".35"/>
          <circle cx="31" cy="40" r="6" fill="#C9A15F" opacity=".8"/>
        </g>
        ${ground(268, p.near, .9)}
        <path d="M0 288 h 400" stroke="${p.ink}" stroke-width="1" opacity=".12"/>
        ${tree(160, 292, 64, p.ink, .7)}
        ${bamboo(366, 296, 70, p.ink)}
        <g opacity=".3" stroke="#FFFFFF" stroke-width="2" fill="none">
          <path d="M10 282 q 30 -4 60 0"/><path d="M250 288 q 30 -4 60 0"/>
        </g>`;
    },

    hall(r) {
      const p = PAL.hall;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(322, 54, 13, uid, p.sun)}
        ${hill(156, 22, p.far, .55)}
        ${hallBuilding(34, 262, 180, 104, '#EADCC0', '#59564B', p.ink, '#A9543D')}
        ${hallBuilding(228, 276, 132, 78, '#E5D5B7', '#625E50', p.ink, '#A9543D')}
        ${ground(262, p.near, .85)}
        <g fill="${p.ink}" opacity=".35">
          <rect x="120" y="236" width="60" height="6"/>
          <rect x="128" y="242" width="44" height="6"/>
          <rect x="136" y="248" width="28" height="6"/>
        </g>
        <rect x="96" y="196" width="34" height="42" fill="#8E3E2E" opacity=".55"/>
        <path d="M96 202 h 34 M96 212 h 34 M96 222 h 34" stroke="#D9C6A6" stroke-width="1" opacity=".5"/>
        ${tree(374, 292, 58, p.ink, .65)}
        ${bird(70, 84, 3, p.ink, .3)}`;
    },

    museum(r) {
      const p = PAL.museum;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(302, 48, 12, uid, p.sun)}
        ${hill(172, 18, p.far, .45)}
        <rect y="120" width="400" height="80" fill="url(#haze${uid})"/>

        <g transform="translate(52 78)">
          <!-- 主体 -->
          <rect x="0" y="106" width="296" height="76" fill="#E8E0CD"/>
          <rect x="0" y="94" width="296" height="14" fill="#6B6A5E"/>
          <rect x="0" y="182" width="296" height="6" fill="#8E8A7A" opacity=".5"/>

          <!-- 鼓楼式塔身 -->
          <rect x="184" y="34" width="76" height="62" fill="#6E7B66"/>
          <path d="M176 36 L222 -4 L268 36 Z" fill="#5C6A55"/>
          <path d="M176 36 q 10 -14 24 -7" fill="none" stroke="#5C6A55" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M268 36 q -10 -14 -24 -7" fill="none" stroke="#5C6A55" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M182 62 L262 62 L254 76 L190 76 Z" fill="#57644F"/>
          <g fill="#4F5C4A" opacity=".65">
            <rect x="196" y="42" width="7" height="50"/><rect x="240" y="42" width="7" height="50"/>
          </g>
          <circle cx="222" cy="-8" r="3.6" fill="#C9A15F"/>

          <!-- 展窗 -->
          <g fill="#8E9B84" opacity=".45">
            <rect x="22" y="118" width="40" height="48"/><rect x="78" y="118" width="40" height="48"/>
            <rect x="134" y="118" width="34" height="48"/><rect x="212" y="118" width="34" height="48"/>
            <rect x="256" y="118" width="24" height="48"/>
          </g>
          <rect x="22" y="166" width="258" height="3" fill="#6B6A5E" opacity=".3"/>
        </g>
        <path d="M0 300 L0 268 C 60 254 120 274 180 264 C 240 254 300 272 360 262 C 380 258 392 264 400 260 L400 300 Z" fill="${p.near}"/>
        ${tree(36, 300, 68, p.ink, .65)}${tree(368, 300, 52, p.ink, .55)}
        ${cloud(112, 58, .8, .38)}`;
    },

    cave(r) {
      const p = PAL.cave;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(340, 48, 12, uid, p.sun)}
        <path d="M0 300 L0 140 C 40 128 84 136 96 120 C 110 102 92 78 108 58 C 124 38 160 44 184 62 C 206 78 200 104 216 118 C 236 136 300 130 340 142 C 366 150 384 146 400 150 L400 300 Z" fill="${p.far}" opacity=".85"/>
        <path d="M104 300 C 96 236 128 196 200 194 C 272 192 304 234 296 300 Z" fill="${p.ink}"/>
        <path d="M124 300 C 118 250 146 218 200 216 C 254 214 282 248 276 300 Z" fill="#3B2F1E"/>
        <g stroke="${p.mid}" stroke-width="2" opacity=".35">
          <path d="M20 190 q 40 -8 80 2"/><path d="M300 186 q 44 -10 90 0"/><path d="M0 220 q 40 -6 78 2"/>
        </g>
        <g fill="#7A6242" opacity=".5">
          <circle cx="176" cy="248" r="3"/><circle cx="224" cy="240" r="2.4"/><circle cx="200" cy="268" r="2.2"/>
        </g>
        ${ground(288, p.near, .8)}
        ${bamboo(348, 296, 76, p.ink)}
        ${bird(70, 92, 3, p.ink, .35)}`;
    },

    island(r) {
      const p = PAL.island;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(88, 56, 15, uid, p.sun)}
        ${[20, 74, 130, 186, 244].map(x => karst(x, 158, 52 + r() * 34, 70, p.far, .45)).join('')}
        <rect y="158" width="400" height="142" fill="#C6DEDC"/>
        <rect y="158" width="400" height="142" fill="url(#water${uid})"/>
        <path d="M118 216 C 150 190 246 188 288 212 C 310 224 300 246 262 252 C 208 260 138 250 118 236 C 108 228 108 220 118 216 Z" fill="${p.mid}" opacity=".9"/>
        <path d="M126 214 C 158 194 240 192 280 212 C 296 220 288 232 258 236 C 206 244 146 238 126 228 C 118 224 118 218 126 214 Z" fill="${p.near}"/>
        <g transform="translate(186 150)">
          <rect x="10" y="26" width="26" height="30" fill="#E4D6BC"/>
          <path d="M2 28 L23 8 L44 28 Z" fill="#6E5B43"/>
          <path d="M2 28 q 6 -9 14 -4" fill="none" stroke="#6E5B43" stroke-width="2" stroke-linecap="round"/>
          <path d="M44 28 q -6 -9 -14 -4" fill="none" stroke="#6E5B43" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g transform="translate(250 196)">
          <rect x="0" y="0" width="18" height="26" fill="#D9C9AE"/>
          <path d="M-4 2 L9 -10 L22 2 Z" fill="#6E5B43"/>
        </g>
        <g stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity=".5">
          <path d="M40 250 q 26 -5 52 0"/><path d="M300 262 q 26 -5 52 0"/><path d="M150 278 q 30 -5 60 0"/>
        </g>
        <g transform="translate(48 226)">
          <path d="M0 8 h 54 l -7 9 h -40 z" fill="#A8814F"/>
          <path d="M12 8 v -8 h 30 v 8" fill="none" stroke="#8A6A42" stroke-width="2"/>
        </g>
        ${bird(320, 96, 3, p.ink, .4)}`;
    },

    waterfront(r) {
      const p = PAL.waterfront;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(310, 62, 14, uid, p.sun)}
        ${cloud(110, 56, 1, .45)}
        <g fill="${p.far}" opacity=".55">
          <rect x="10" y="170" width="26" height="60"/><rect x="42" y="158" width="20" height="72"/>
          <rect x="68" y="176" width="30" height="54"/><rect x="300" y="164" width="24" height="66"/>
          <rect x="330" y="176" width="30" height="54"/><rect x="366" y="168" width="26" height="62"/>
        </g>
        <path d="M0 196 h 400 v 14 H0 z" fill="${p.mid}" opacity=".8"/>
        <rect y="210" width="400" height="90" fill="#BDD6CE"/>
        <rect y="210" width="400" height="90" fill="url(#water${uid})"/>
        <g opacity=".4" fill="#FFFFFF">
          <rect x="0" y="222" width="400" height="2"/><rect x="0" y="248" width="400" height="2"/>
        </g>
        <path d="M-10 200 C 60 168 120 214 190 198 C 250 184 300 206 410 186" fill="none" stroke="#F3EDDD" stroke-width="7"/>
        <path d="M-10 200 C 60 168 120 214 190 198 C 250 184 300 206 410 186" fill="none" stroke="${p.mid}" stroke-width="1.2" opacity=".4"/>
        <g fill="${p.near}" opacity=".85">
          <rect x="24" y="176" width="8" height="24"/><rect x="14" y="176" width="28" height="6"/>
          <rect x="352" y="172" width="8" height="28"/><rect x="342" y="172" width="28" height="6"/>
        </g>
        <g opacity=".5" stroke="${p.ink}" stroke-width="1.4">
          <path d="M40 244 q 20 -4 40 0"/><path d="M290 258 q 20 -4 40 0"/>
        </g>`;
    },

    mine(r) {
      const p = PAL.mine;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(76, 54, 12, uid, p.sun)}
        ${hill(168, 18, p.far, .5)}
        <g transform="translate(96 74)">
          <path d="M40 122 L40 34 L62 8 L84 34 L84 122" fill="none" stroke="#4E5550" stroke-width="5"/>
          <path d="M40 60 L84 96 M84 60 L40 96" stroke="#4E5550" stroke-width="2.4" opacity=".8"/>
          <circle cx="62" cy="8" r="5" fill="#4E5550"/>
          <rect x="30" y="118" width="64" height="8" fill="#3E443F"/>
        </g>
        <g>
          <rect x="188" y="140" width="26" height="86" fill="#7E7E70"/>
          <rect x="184" y="132" width="34" height="10" fill="#5A5C52"/>
          <g fill="#F0E6D2" opacity=".35">
            <rect x="192" y="150" width="6" height="68"/><rect x="204" y="150" width="6" height="68"/>
          </g>
        </g>
        <rect x="234" y="160" width="150" height="66" fill="#B9B3A1"/>
        <path d="M234 160 h 150 l -12 -16 h -126 z" fill="#8E897A"/>
        <g fill="#6E6B5E" opacity=".55">
          <rect x="250" y="176" width="22" height="34"/><rect x="286" y="176" width="22" height="34"/>
          <rect x="322" y="176" width="22" height="34"/><rect x="358" y="176" width="14" height="34"/>
        </g>
        <g transform="translate(40 208)">
          <rect x="0" y="10" width="92" height="30" rx="4" fill="#3F464A"/>
          <rect x="8" y="18" width="26" height="14" fill="#8D99A0" opacity=".7"/>
          <path d="M34 -12 h 12 v 22 h -12 z" fill="#3F464A"/>
          <circle cx="22" cy="44" r="9" fill="#2C3134"/><circle cx="22" cy="44" r="4" fill="#B9B3A1"/>
          <circle cx="72" cy="44" r="9" fill="#2C3134"/><circle cx="72" cy="44" r="4" fill="#B9B3A1"/>
          <rect x="60" y="-20" width="8" height="26" fill="#3F464A"/>
          <circle cx="64" cy="-22" r="6" fill="#D9D2BF" opacity=".5"/>
        </g>
        ${ground(232, p.near, .9)}
        <g opacity=".35" fill="${p.ink}">
          <ellipse cx="300" cy="288" rx="46" ry="10"/>
        </g>`;
    },

    ridge(r) {
      const p = PAL.ridge;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        <circle cx="200" cy="118" r="46" fill="#F6DFB4" opacity=".5"/>
        ${sun(200, 118, 22, uid, p.sun)}
        <path d="M0 300 L0 206 C 46 190 84 208 122 194 C 160 180 190 196 224 186 C 262 174 300 190 340 180 C 366 174 384 180 400 176 L400 300 Z" fill="${p.far}" opacity=".8"/>
        <path d="M0 300 L0 244 C 50 224 92 244 132 232 C 176 218 210 236 250 226 C 296 214 344 232 400 220 L400 300 Z" fill="${p.mid}" opacity=".92"/>
        <path d="M0 300 L0 272 C 60 258 110 276 168 266 C 226 256 280 274 336 264 C 362 260 382 264 400 260 L400 300 Z" fill="${p.near}"/>
        <g opacity=".45" stroke="${p.ink}" stroke-width="1.4" fill="none">
          <path d="M40 288 q 10 -10 18 -2"/><path d="M76 282 q 10 -10 18 -2"/><path d="M300 286 q 10 -10 18 -2"/>
          <path d="M330 278 q 10 -10 18 -2"/>
        </g>
        ${bird(96, 92, 4, p.ink, .35)}${bird(130, 78, 3, p.ink, .28)}
        <g opacity=".22" fill="#FFFFFF">
          <rect y="196" width="400" height="16" rx="8"/><rect y="222" width="400" height="10" rx="5"/>
        </g>`;
    },

    spring(r) {
      const p = PAL.spring;
      let steam = '';
      for (let i = 0; i < 5; i++) {
        const x = 108 + i * 46;
        steam += `<path d="M${x} 216 c -11 -15 11 -24 0 -41 c -9 -15 9 -20 2 -32" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" opacity="${.26 + i * .04}"/>`;
      }
      let stones = '';
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (0.08 + i * 0.084);
        const x = 202 + Math.cos(a) * 128;
        const y = 262 + Math.sin(a) * 30;
        stones += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="5" fill="${p.ink}" opacity=".28"/>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${hill(158, 20, p.far, .42)}
        <rect y="150" width="400" height="70" fill="url(#haze${uid})"/>

        <!-- 竹林与温泉亭 -->
        ${bamboo(38, 256, 76, p.mid)}
        <g transform="translate(292 150)">
          <rect x="8" y="52" width="64" height="8" fill="#8C7550" opacity=".8"/>
          <g stroke="#7E6746" stroke-width="3.4">
            <line x1="16" y1="52" x2="16" y2="96"/><line x1="64" y1="52" x2="64" y2="96"/>
            <line x1="40" y1="52" x2="40" y2="96"/>
          </g>
          <path d="M-4 52 L40 26 L84 52 Z" fill="#6E5B3E"/>
          <path d="M-4 52 q 10 -15 24 -8" fill="none" stroke="#6E5B3E" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M84 52 q -10 -15 -24 -8" fill="none" stroke="#6E5B3E" stroke-width="2.6" stroke-linecap="round"/>
          <circle cx="40" cy="20" r="3.4" fill="#C9A15F"/>
        </g>

        <!-- 汤池 -->
        <path d="M0 236 C 70 218 132 240 202 230 C 272 220 332 242 400 226 L400 300 L0 300 Z" fill="${p.mid}" opacity=".45"/>
        <ellipse cx="202" cy="264" rx="142" ry="36" fill="${p.near}" opacity=".85"/>
        <ellipse cx="202" cy="260" rx="128" ry="28" fill="#CFE6E2"/>
        <ellipse cx="202" cy="258" rx="112" ry="20" fill="#BFDDD8"/>
        <g stroke="#FFFFFF" stroke-width="1.5" opacity=".5" fill="none">
          <ellipse cx="202" cy="254" rx="74" ry="10"/><ellipse cx="202" cy="260" rx="46" ry="6"/>
        </g>
        ${steam}
        ${stones}
        <g fill="${p.ink}" opacity=".45">
          <ellipse cx="70" cy="272" rx="22" ry="9"/><ellipse cx="338" cy="278" rx="20" ry="8"/>
        </g>
        ${ground(286, p.near, .5)}`;
    },

    night(r) {
      const p = PAL.night;
      let lanterns = '';
      for (let i = 0; i < 9; i++) {
        const x = 20 + i * 45, y = 74 + (i % 3) * 26;
        lanterns += `<g><line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y}" stroke="#F2D9A8" stroke-width="1" opacity=".35"/>
          <ellipse cx="${x}" cy="${y + 6}" rx="7" ry="9" fill="${i % 2 ? '#E8A45C' : '#D9633F'}" opacity=".92"/>
          <circle cx="${x}" cy="${y + 6}" r="18" fill="url(#glowLantern)" opacity=".5"/></g>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(320, 54, 13, uid, p.sun)}
        <g fill="#FFFFFF" opacity=".5">
          <circle cx="60" cy="40" r="1.4"/><circle cx="120" cy="28" r="1"/><circle cx="200" cy="46" r="1.2"/>
          <circle cx="268" cy="26" r="1"/><circle cx="360" cy="44" r="1.3"/>
        </g>
        <path d="M0 190 L0 150 C 40 138 70 156 110 146 C 150 136 180 152 220 142 C 260 132 300 150 340 140 C 370 132 386 140 400 136 L400 190 Z" fill="${p.far}"/>
        <g fill="${p.mid}">
          <rect x="10" y="176" width="46" height="52"/><rect x="64" y="164" width="38" height="64"/>
          <rect x="110" y="180" width="52" height="48"/><rect x="170" y="168" width="42" height="60"/>
          <rect x="220" y="182" width="50" height="46"/><rect x="278" y="170" width="40" height="58"/>
          <rect x="326" y="180" width="54" height="48"/>
        </g>
        <g fill="#F2CE8A" opacity=".55">
          <rect x="20" y="188" width="8" height="8"/><rect x="38" y="204" width="8" height="8"/>
          <rect x="74" y="180" width="8" height="8"/><rect x="120" y="196" width="8" height="8"/>
          <rect x="182" y="184" width="8" height="8"/><rect x="232" y="198" width="8" height="8"/>
          <rect x="288" y="186" width="8" height="8"/><rect x="340" y="196" width="8" height="8"/>
        </g>
        <path d="M0 232 h 400 v 6 H0 z" fill="${p.near}"/>
        <rect y="238" width="400" height="62" fill="#151A29"/>
        <g opacity=".5" fill="#F2CE8A">
          <rect x="30" y="246" width="18" height="3"/><rect x="120" y="252" width="26" height="3"/>
          <rect x="230" y="246" width="20" height="3"/><rect x="320" y="254" width="24" height="3"/>
        </g>
        ${lanterns}
        <g>
          <path d="M132 196 q 66 16 136 0" fill="none" stroke="#F2CE8A" stroke-width="1.6" opacity=".55"/>
          <g fill="#D9633F">
            <circle cx="158" cy="204" r="4.4"/><circle cx="196" cy="209" r="4.4"/>
            <circle cx="236" cy="208" r="4.4"/><circle cx="272" cy="200" r="4"/>
          </g>
        </g>`;
    },

    oldtown(r) {
      const p = PAL.oldtown;
      let arcade = '';
      for (let i = 0; i < 4; i++) {
        const x = 18 + i * 96;
        arcade += `<g>
          <rect x="${x}" y="${150 + (i % 2) * 8}" width="82" height="110" fill="${i % 2 ? '#E7DCC4' : '#EFE5D0'}"/>
          <path d="M${x} ${150 + (i % 2) * 8} h 82 l -6 -12 h -70 z" fill="${p.mid}"/>
          <path d="M${x + 10} ${200} a 18 22 0 0 1 36 0 v 60 h -36 z" fill="#8E8064" opacity=".55"/>
          <path d="M${x + 46} ${200} a 14 18 0 0 1 28 0 v 60 h -28 z" fill="#8E8064" opacity=".45"/>
          <g stroke="${p.ink}" stroke-width="1" opacity=".2">
            <line x1="${x}" y1="${182}" x2="${x + 82}" y2="${182}"/>
          </g>
        </g>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(60, 58, 13, uid, p.sun)}
        ${hill(160, 16, p.far, .4)}
        ${arcade}
        ${ground(258, p.near, .9)}
        <g>
          <rect x="286" y="140" width="14" height="110" fill="#6F5F45"/>
          <ellipse cx="293" cy="126" rx="52" ry="34" fill="${p.mid}" opacity=".85"/>
          <ellipse cx="262" cy="140" rx="30" ry="22" fill="${p.mid}" opacity=".8"/>
          <ellipse cx="326" cy="142" rx="28" ry="20" fill="${p.mid}" opacity=".8"/>
        </g>
        <g opacity=".35" stroke="${p.ink}" stroke-width="1.2" fill="none">
          <path d="M20 282 q 20 -6 40 0"/><path d="M120 288 q 20 -6 40 0"/>
        </g>
        ${bird(200, 66, 3, p.ink, .3)}`;
    },

    field(r) {
      const p = PAL.field;
      let rows = '';
      for (let i = 0; i < 5; i++) {
        rows += `<path d="M0 ${196 + i * 22} C 80 ${186 + i * 22} 150 ${202 + i * 22} 220 ${192 + i * 22} C 290 ${182 + i * 22} 340 ${198 + i * 22} 400 ${190 + i * 22}" fill="none" stroke="${i % 2 ? p.mid : p.near}" stroke-width="9" opacity="${.55 - i * .06}"/>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(318, 54, 14, uid, p.sun)}
        ${hill(150, 20, p.far, .7)}
        ${[30, 86, 150, 214, 280].map(x => stiltHouse(x, 172, 34, 34, '#E9DDC2', '#6E5C43', p.ink)).join('')}
        <rect y="176" width="400" height="124" fill="${p.far}"/>
        ${rows}
        ${[0, 1, 2, 3, 4, 5].map(i => `<g opacity=".5" stroke="${p.ink}" stroke-width="1.2"><path d="M${20 + i * 68} ${272} v -14"/><path d="M${20 + i * 68} ${272} l -5 -8 M${20 + i * 68} ${272} l 5 -8"/></g>`).join('')}
        ${cloud(90, 52, .9, .4)}
        ${bird(250, 96, 3, p.ink, .35)}`;
    },

    river(r) {
      const p = PAL.river;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(84, 54, 15, uid, p.sun)}
        <g opacity=".9">
          ${[36, 100, 164, 236, 300, 360].map((x, i) => karst(x, 168, 58 + (i % 3) * 22, 76, p.far, .6)).join('')}
          ${[10, 76, 140, 210, 280, 350].map(x => karst(x, 180, 40 + r() * 30, 66, p.mid, .75)).join('')}
        </g>
        <rect y="180" width="400" height="120" fill="#C4DACE"/>
        <rect y="180" width="400" height="120" fill="url(#water${uid})"/>
        <g opacity=".45" stroke="#FFFFFF" stroke-width="2" fill="none">
          <path d="M20 214 q 30 -5 60 0"/><path d="M180 232 q 34 -5 68 0"/><path d="M300 210 q 28 -5 56 0"/>
        </g>
        <g transform="translate(120 238)">
          <path d="M0 10 h 62 l -8 10 h -46 z" fill="#96733F"/>
          <path d="M14 10 v -14 h 30 v 14" fill="#C9C2A4"/>
          <path d="M14 10 q 15 -8 30 0" fill="#7E6540"/>
        </g>
        <path d="M0 292 C 60 276 120 292 180 284 C 250 274 330 292 400 282" fill="none" stroke="${p.near}" stroke-width="2" opacity=".5"/>
        <g fill="${p.ink}" opacity=".75">
          <ellipse cx="352" cy="268" rx="26" ry="8"/><rect x="346" y="242" width="4" height="26"/>
          <ellipse cx="366" cy="252" rx="14" ry="8"/>
        </g>`;
    },

    weave(r) {
      const p = PAL.weave;
      let warp = '';
      for (let i = 0; i < 14; i++) {
        warp += `<line x1="${128 + i * 10}" y1="96" x2="${128 + i * 10}" y2="212" stroke="${['#B8553F', '#C99A46', '#3F6B78', '#7A8A52'][i % 4]}" stroke-width="3" opacity=".55"/>`;
      }
      let weft = '';
      for (let i = 0; i < 9; i++) {
        weft += `<rect x="122" y="${102 + i * 12}" width="148" height="6" fill="${['#B8553F', '#C99A46', '#3F6B78'][i % 3]}" opacity=".35"/>`;
      }
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${sun(330, 56, 12, uid, p.sun)}
        <rect x="96" y="60" width="212" height="18" rx="4" fill="#8A7452"/>
        <rect x="96" y="214" width="212" height="16" rx="4" fill="#8A7452"/>
        <rect x="96" y="60" width="14" height="180" fill="#7A6647"/>
        <rect x="294" y="60" width="14" height="180" fill="#7A6647"/>
        ${warp}${weft}
        <rect x="196" y="60" width="10" height="180" fill="#6E5B3E" opacity=".5"/>
        <g fill="${p.ink}" opacity=".45">
          <circle cx="240" cy="150" r="16"/><circle cx="240" cy="150" r="7" fill="${p.sky[0]}"/>
        </g>
        ${ground(244, p.near, .85)}
        <g transform="translate(50 232)" opacity=".8">
          <ellipse cx="0" cy="18" rx="20" ry="7" fill="${p.ink}" opacity=".2"/>
          <path d="M-14 4 h 28 l -5 14 h -18 z" fill="#C9A15F"/>
        </g>`;
    },

    bowl(r) {
      const p = PAL.bowl;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        <circle cx="200" cy="128" r="96" fill="#FFFFFF" opacity=".45"/>
        ${sun(326, 58, 12, uid, p.sun)}
        <g opacity=".22" stroke="${p.near}" stroke-width="4" fill="none" stroke-linecap="round">
          <path d="M150 108 c -10 -14 10 -20 0 -34"/><path d="M200 100 c -10 -14 10 -20 0 -34"/>
          <path d="M250 106 c -10 -14 10 -20 0 -34"/>
        </g>
        <ellipse cx="200" cy="214" rx="106" ry="20" fill="${p.near}" opacity=".18"/>
        <path d="M96 150 h 208 c 0 52 -42 86 -104 86 c -62 0 -104 -34 -104 -86 z" fill="#EFE4CC"/>
        <path d="M96 150 h 208 c 0 12 -4 22 -10 32 h -188 c -6 -10 -10 -20 -10 -32 z" fill="#F8F1E1"/>
        <ellipse cx="200" cy="150" rx="104" ry="18" fill="#E2D2B0"/>
        <ellipse cx="200" cy="149" rx="94" ry="14" fill="#D9C49B"/>
        <g fill="#C09A5E" opacity=".85">
          <ellipse cx="170" cy="147" rx="18" ry="6"/><ellipse cx="212" cy="152" rx="22" ry="6"/>
          <ellipse cx="244" cy="145" rx="14" ry="5"/>
        </g>
        <g fill="#7C9A5E">
          <ellipse cx="188" cy="142" rx="10" ry="4"/><ellipse cx="226" cy="156" rx="12" ry="4"/>
        </g>
        <g stroke="#B8553F" stroke-width="2" fill="none" opacity=".5">
          <path d="M150 160 q 20 8 40 2"/><path d="M214 166 q 20 6 40 -2"/>
        </g>
        <path d="M104 236 q 96 26 192 0" fill="none" stroke="${p.near}" stroke-width="3" opacity=".3"/>
        <g stroke="${p.near}" stroke-width="3" stroke-linecap="round" opacity=".7">
          <path d="M300 78 l 42 -34"/><path d="M306 84 l 42 -34"/>
        </g>`;
    },

    tea(r) {
      const p = PAL.tea;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${hill(150, 24, p.far, .6)}
        ${hill(178, 18, p.mid, .55)}
        ${sun(318, 56, 12, uid, p.sun)}
        <g transform="translate(200 196)">
          <ellipse cx="0" cy="46" rx="76" ry="14" fill="${p.ink}" opacity=".16"/>
          <path d="M-40 6 h 80 c 0 26 -18 42 -40 42 s -40 -16 -40 -42 z" fill="#E8DCC0"/>
          <ellipse cx="0" cy="6" rx="40" ry="10" fill="#D5C39E"/>
          <ellipse cx="0" cy="6" rx="32" ry="7" fill="#B99C6A"/>
          <path d="M40 16 q 22 4 0 20" fill="none" stroke="#E8DCC0" stroke-width="7"/>
          <g fill="#FFFFFF" opacity=".4">
            <ellipse cx="0" cy="4" rx="30" ry="6"/>
          </g>
        </g>
        <g opacity=".3" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round">
          <path d="M186 158 c -8 -12 8 -18 0 -30"/><path d="M214 154 c -8 -12 8 -18 0 -30"/>
        </g>
        <g fill="#C9A15F">
          <circle cx="150" cy="214" r="4"/><circle cx="166" cy="226" r="3"/><circle cx="250" cy="218" r="4"/>
        </g>
        ${ground(252, p.near, .8)}
        ${bamboo(52, 288, 74, p.ink)}
        <g opacity=".5" fill="${p.ink}">
          <ellipse cx="320" cy="272" rx="30" ry="8"/>
        </g>`;
    },

    jar(r) {
      const p = PAL.jar;
      return `<rect width="400" height="300" fill="url(#sky${uid})"/>
        ${hill(160, 20, p.far, .45)}
        ${sun(330, 54, 12, uid, p.sun)}
        <g transform="translate(200 210)">
          <ellipse cx="0" cy="52" rx="66" ry="12" fill="${p.ink}" opacity=".18"/>
          <path d="M-34 -22 c -10 12 -18 34 -18 52 c 0 24 24 34 52 34 s 52 -10 52 -34 c 0 -18 -8 -40 -18 -52 z" fill="#B98A56"/>
          <path d="M-34 -22 c 12 8 56 8 68 0 l 4 14 c -14 9 -62 9 -76 0 z" fill="#8E6238"/>
          <ellipse cx="0" cy="-22" rx="34" ry="10" fill="#C79A63"/>
          <ellipse cx="0" cy="-24" rx="24" ry="6" fill="#7A5330"/>
          <path d="M-20 10 c 8 6 32 6 40 0" fill="none" stroke="#8E6238" stroke-width="3" opacity=".6"/>
        </g>
        <g transform="translate(120 236)">
          <ellipse cx="0" cy="12" rx="26" ry="7" fill="${p.ink}" opacity=".16"/>
          <path d="M-16 -6 h 32 l -4 16 h -24 z" fill="#D9C49B"/>
          <circle cx="-4" cy="-12" r="7" fill="#B8553F" opacity=".7"/>
          <circle cx="10" cy="-14" r="6" fill="#7C9A5E" opacity=".7"/>
        </g>
        <g fill="#C9A15F" opacity=".7">
          <circle cx="300" cy="244" r="5"/><circle cx="318" cy="256" r="4"/><circle cx="286" cy="258" r="3.5"/>
        </g>
        ${ground(262, p.near, .75)}
        ${bamboo(360, 296, 62, p.ink)}`;
    }
  };

  /* ---------- 首页主视觉 ---------- */
  function heroScene() {
    uid++;
    const r = rand(4177);
    const p = PAL.peak;
    const far = cluster(60, 430, 330, 210, 3, p.far, .54, r)
      + cluster(408, 424, 288, 190, 3, p.far, .48, r)
      + cluster(660, 432, 250, 180, 2, p.far, .42, r);
    const mid = cluster(214, 492, 236, 182, 3, p.mid, .9, r)
      + cluster(566, 496, 186, 158, 2, p.mid, .8, r);

    return `<svg class="scene-svg" viewBox="0 0 720 660" preserveAspectRatio="xMidYMid slice"
      role="img" aria-label="来宾山水插画：远山、红水河与瑶寨吊脚楼">
      <defs>
        <linearGradient id="sky${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#E5F1EB"/><stop offset=".55" stop-color="#F3F7ED"/><stop offset="1" stop-color="#FBF7EC"/>
        </linearGradient>
        <linearGradient id="water${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".6"/><stop offset="1" stop-color="#6F9A88" stop-opacity=".35"/>
        </linearGradient>
        <radialGradient id="glow${uid}">
          <stop offset="0" stop-color="${p.sun}" stop-opacity=".5"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <rect width="720" height="660" fill="url(#sky${uid})"/>
      <circle cx="502" cy="148" r="150" fill="url(#glow${uid})"/>
      <circle cx="502" cy="148" r="54" fill="${p.sun}" opacity=".9"/>
      ${cloud(148, 116, 2.1, .48)}${cloud(600, 88, 1.5, .4)}${cloud(346, 62, 1.1, .32)}

      ${far}
      ${mist(452, 30, .45, 760)}
      <g stroke="${p.ink}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".32">
        <path d="M214 264 q 9 -8 18 0 M236 264 q 9 -8 18 0"/>
        <path d="M268 232 q 7 -6 14 0 M284 232 q 7 -6 14 0"/>
        <path d="M176 302 q 6 -5 12 0 M190 302 q 6 -5 12 0"/>
      </g>
      ${mid}
      ${mist(494, 24, .38, 760)}

      <!-- 红水河 -->
      <path d="M0 520 C 118 504 224 540 336 528 C 452 516 566 546 720 526 L720 604 C 560 626 452 596 336 606 C 222 616 120 584 0 600 Z" fill="#C2DBD3"/>
      <path d="M0 520 C 118 504 224 540 336 528 C 452 516 566 546 720 526 L720 604 C 560 626 452 596 336 606 C 222 616 120 584 0 600 Z" fill="url(#water${uid})"/>
      <g stroke="#FFFFFF" stroke-width="2.6" fill="none" opacity=".52" stroke-linecap="round">
        <path d="M42 548 q 36 -6 72 0"/><path d="M186 562 q 42 -6 84 0"/>
        <path d="M394 552 q 42 -6 84 0"/><path d="M566 570 q 38 -6 76 0"/>
      </g>
      <g transform="translate(452 546)">
        <path d="M0 12 h 74 l -9 11 h -56 z" fill="#A8814F"/>
        <rect x="12" y="0" width="50" height="12" rx="3" fill="#C79A63"/>
        <rect x="34" y="-12" width="3" height="12" fill="#8A6A42"/>
        <path d="M16 23 q 20 6 40 0 l -5 7 h -30 z" fill="#2E4C49" opacity=".26"/>
      </g>

      <!-- 近岸 -->
      <path d="M0 614 C 122 598 224 632 336 622 C 452 612 566 640 720 620 L720 660 L0 660 Z" fill="#456F5F"/>

      <!-- 瑶寨：吊脚楼 + 鼓楼 -->
      <g>
        ${stiltHouse(74, 640, 50, 48, '#DCCDAF', '#6B5A44', p.ink)}
        ${stiltHouse(118, 648, 58, 56, '#EADCC2', '#6B5A44', p.ink)}
        ${stiltHouse(182, 654, 64, 60, '#EFE2CA', '#5E4E3A', p.ink)}
        ${stiltHouse(252, 644, 50, 46, '#E7D8BC', '#6B5A44', p.ink)}
        ${stiltHouse(408, 650, 46, 42, '#DDCEB2', '#6B5A44', p.ink)}
        <g transform="translate(310 528)">
          <rect x="8" y="46" width="44" height="72" fill="#E3D3B6"/>
          <path d="M-4 48 L30 16 L64 48 Z" fill="#6B5A44"/>
          <path d="M-4 48 q 8 -12 20 -6" fill="none" stroke="#6B5A44" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M64 48 q -8 -12 -20 -6" fill="none" stroke="#6B5A44" stroke-width="2.6" stroke-linecap="round"/>
          <rect x="18" y="60" width="9" height="28" fill="${p.ink}" opacity=".32"/>
          <rect x="35" y="60" width="9" height="28" fill="${p.ink}" opacity=".32"/>
          <circle cx="30" cy="40" r="6" fill="#C9A15F" opacity=".85"/>
        </g>
        ${tree(392, 648, 62, p.ink, .55)}
      </g>

      <!-- 梯田 -->
      <g fill="none" stroke="#A9C6AD" stroke-width="8" opacity=".55" stroke-linecap="round">
        <path d="M470 626 C 542 610 622 622 720 606"/>
        <path d="M448 650 C 532 632 622 646 720 628"/>
      </g>

      <!-- 前景 -->
      <g fill="#1F3D35">
        <rect x="30" y="592" width="6" height="32"/>
        <path d="M33 496 L70 596 L48 596 L82 640 L-18 640 L15 596 L-4 596 Z" opacity=".94"/>
        <rect x="690" y="596" width="5" height="28"/>
        <path d="M693 522 L724 600 L707 600 L734 634 L650 634 L676 600 L660 600 Z" opacity=".88"/>
      </g>
      <g stroke="#8FAE9C" stroke-width="2" stroke-linecap="round" fill="none" opacity=".45">
        <path d="M60 646 q 8 -10 16 -2"/><path d="M336 654 q 8 -10 16 -2"/><path d="M470 644 q 8 -10 16 -2"/>
      </g>
      <g stroke="#1F3D35" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7">
        <path d="M604 660 q -4 -42 2 -74"/><path d="M606 620 q -15 -8 -21 -17"/>
        <path d="M626 660 q -4 -32 4 -58"/><path d="M628 634 q 13 -8 17 -17"/>
      </g>
    </svg>`;
  }

  function build(kind, seed = 1, label = '', align = 'xMidYMid') {
    const pal = PAL[kind] || PAL.peak;
    uid++;
    const id = uid;
    const r = rand(seed);
    const body = (SCENES[kind] || SCENES.peak)(r);
    return `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="${align} slice" role="img" aria-label="${label}" focusable="false">
      <defs>
        <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${pal.sky[0]}"/><stop offset="1" stop-color="${pal.sky[1]}"/>
        </linearGradient>
        <linearGradient id="water${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="${pal.mid}" stop-opacity=".28"/>
        </linearGradient>
        <radialGradient id="glow${id}">
          <stop offset="0" stop-color="${pal.sun}" stop-opacity=".38"/>
          <stop offset="1" stop-color="${pal.sun}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="haze${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset=".55" stop-color="#FFFFFF" stop-opacity=".55"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity=".8"/>
        </linearGradient>
        <radialGradient id="glowLantern">
          <stop offset="0" stop-color="#F7C888" stop-opacity=".55"/>
          <stop offset="1" stop-color="#F7C888" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${body}
    </svg>`;
  }

  /* ---------- 小图标 ---------- */
  const ICONS = {
    mountain: '<path d="M3 19h18L14.5 7l-3.2 5.6L9 9.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 19h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    hall: '<path d="M3 9.5 12 4l9 5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 9.5V19h14V9.5M9 19v-5h6v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    drum: '<ellipse cx="12" cy="7" rx="6" ry="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 7v9c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 10.5v6M15 10.5v6" stroke="currentColor" stroke-width="1.2" opacity=".5"/>',
    spring: '<path d="M4 18c0-3 2.2-4 4-4s4 1 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 18c0-3 2.2-4 4-4s4 1 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 8c-1-1.6 1-2.4 0-4M13 8c-1-1.6 1-2.4 0-4M18 8c-1-1.6 1-2.4 0-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>',
    kite: '<path d="M12 3l6 5-6 6-6-6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 14v6M12 20c-2 1-3 0-4 1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    lantern: '<path d="M12 4c3.3 0 5 2.4 5 5.5S15.3 15 12 15 7 12.6 7 9.5 8.7 4 12 4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 15v3M9 21h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    arrow: '<path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    clock: '<circle cx="12" cy="12" r="8.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 1.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    ticket: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v1a2.5 2.5 0 0 0 0 5v1A2.5 2.5 0 0 1 17.5 18h-11A2.5 2.5 0 0 1 4 15.5v-1a2.5 2.5 0 0 0 0-5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 6v12" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2" opacity=".6"/>',
    cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    search: '<circle cx="11" cy="11" r="6.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.3A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.7C19 15.6 12 20 12 20z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    print: '<path d="M7 9V4h10v5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4" y="9" width="16" height="7" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 14h10v6H7z" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  };

  function icon(name, size = 20) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  window.Scene = { build, icon, hero: heroScene };
})();
