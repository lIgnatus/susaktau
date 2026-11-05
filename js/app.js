/* Движок презентации: слайды, фон из роликов с дрона, плашки-слайды внизу, кнопки «Старт», «Назад», «Вперёд».
   Клавиши: → PageDown пробел вперёд, ← PageUp назад, Home первый, End последний, F полный экран, T текст выступления.
   Пульт-кликер работает, он посылает PageDown и PageUp. Адрес index.html#5 открывает пятый слайд. */
(function () {
'use strict';
const S = window.SLIDES, L = window.LAYERS, M = window.META, PLANTS = window.PLANTS;
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lyStyle = k => { const l = L[k]; return `--lc:${l.c};--lo:${l.o};--lt:${l.tint}`; };

/* ---------- маленькие картинки ---------- */
const cone = (x, base, h, w) => `M${x - w / 2} ${base} C${x - w * .22} ${base} ${x - w * .07} ${base - h * .5} ${x} ${base - h} C${x + w * .07} ${base - h * .5} ${x + w * .22} ${base} ${x + w / 2} ${base} Z`;
const peakSvg = (fill, stroke) => `<svg viewBox="0 0 100 50" aria-hidden="true"><path d="${cone(50, 50, 48, 100)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;

/* гравюра Сусак-тау с плашки портала: свои id и цвета через переменные --hatch, --outline, --cardbg */
function plaqueSvg(i) {
  return window.SUSAK_SVG
    .replace(/id="(hf|rf|gf|kf|cf)2"/g, (m, a) => `id="${a}p${i}"`)
    .replace(/url\(#(hf|rf|gf|kf|cf)2\)/g, (m, a) => `url(#${a}p${i})`)
    .replace('stroke="#5B7A34" stroke-width="1.25"', 'style="stroke:var(--hatch)" stroke-width="2.1"')
    .replace('stroke="#3E5524"', 'style="stroke:var(--outline)"')
    .replace('style="fill:#FFFFFF"', 'style="fill:var(--cardbg)"');
}

/* схема района: фон портала (рельеф и объекты OSM, участок 18 × 11 км), поверх отметки работы */
function mapSvg() {
  const ink = '#1F2B22';
  const pill = (x, y, t, a = 'start', it = false) => `<g class="pl"><rect class="pill" rx="9"/><text class="lb${it ? ' it' : ''}" x="${x}" y="${y}" text-anchor="${a}">${t}</text></g>`;
  const mk = (d, inner) => `<g class="mk" style="--d:${d}">${inner}</g>`;
  const tri = (x, y, s) => `<path d="M${x} ${y - s} L${x + s * .95} ${y + s * .65} L${x - s * .95} ${y + s * .65} Z" fill="${ink}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  const km = 1600 / 18; // 1 км в единицах схемы
  /* подписи сёл и гор кладутся поверх мелких подписей самой схемы и закрывают их */
  return `<svg viewBox="640 135 840 770" preserveAspectRatio="xMidYMid slice" aria-label="Схема района исследования">
  <image href="img/skhema.webp" x="0" y="0" width="1600" height="1000" preserveAspectRatio="none"/>
  <circle cx="1087" cy="306" r="42" fill="none" stroke="${L.l1.c}" stroke-width="5" stroke-dasharray="10 8" opacity=".9"/>
  ${mk(0, tri(1087, 312, 18) + pill(1112, 322, 'Сусак-тау, 269 м'))}
  ${mk(1, tri(1113, 636, 13) + pill(1132, 646, 'Сатыр-тау'))}
  ${mk(2, pill(848, 190, 'Чураево, школьный музей', 'middle'))}
  ${mk(3, pill(1142, 820, 'Кипчак-Аскарово', 'middle'))}
  ${mk(4, `<rect x="1052" y="368" width="20" height="20" fill="${L.l3.c}" stroke="#fff" stroke-width="3"/>` + pill(1040, 386, 'Туктаровская мельница', 'end'))}
  ${mk(5, `<circle cx="1176" cy="368" r="11" fill="#fff" stroke="${L.l3.c}" stroke-width="5" stroke-dasharray="6 4"/>` + pill(1196, 377, 'Туктарово, исчезла'))}
  ${mk(6, `<path d="M975 822 L992 840 L975 858 L958 840 Z" fill="${L.l2.c}" stroke="#fff" stroke-width="3"/>` + pill(1002, 856, 'Находка 2022'))}
  <text class="lb it" x="1004" y="482" style="paint-order:stroke;stroke:#fff;stroke-width:6px">р. Дёма</text>
  <g class="north" transform="translate(1440 190)"><path d="M0 -34 L13 8 L0 0 L-13 8 Z" fill="${ink}"/><text class="lb" x="0" y="34" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:6px">С</text></g>
  <g class="scale" transform="translate(670 840)">
    <rect x="-14" y="-38" width="${2 * km + 70}" height="62" rx="9" fill="rgba(255,255,255,.92)"/>
    <rect x="0" y="0" width="${km}" height="10" fill="${ink}"/><rect x="${km}" y="0" width="${km}" height="10" fill="#fff" stroke="${ink}" stroke-width="2"/>
    <text class="lb" x="0" y="-10" text-anchor="middle" style="font-size:20px">0</text>
    <text class="lb" x="${km}" y="-10" text-anchor="middle" style="font-size:20px">1</text>
    <text class="lb" x="${2 * km}" y="-10" text-anchor="middle" style="font-size:20px">2 км</text>
  </g>
</svg>`;
}
const legendHtml = () => {
  const i = (svg) => `<svg viewBox="0 0 20 20" aria-hidden="true">${svg}</svg>`;
  return `<div class="leg">
  <span>${i('<path d="M10 2 L18 16 L2 16 Z" fill="#1F2B22"/>')}гора</span>
  <span>${i(`<path d="M10 2 L18 10 L10 18 L2 10 Z" fill="${L.l2.c}"/>`)}находка 2022 года</span>
  <span>${i(`<rect x="3" y="3" width="14" height="14" fill="${L.l3.c}"/>`)}место мельницы</span>
  <span>${i(`<circle cx="10" cy="10" r="6.5" fill="#fff" stroke="${L.l3.c}" stroke-width="3" stroke-dasharray="3 2"/>`)}исчезнувшая деревня</span>
</div>`;
};

/* сигнальные костры: от горы к горе */
function beaconsSvg() {
  const G = 420;
  const hills = [
    { x: 175, h: 250, w: 340, c: '#2F4220', n: 'Сусак-тау' },
    { x: 445, h: 160, w: 290, c: '#3B4A37' },
    { x: 655, h: 112, w: 230, c: '#47554C' },
    { x: 822, h: 78, w: 175, c: '#56625C' }
  ];
  const top = h => G - h.h - 4;
  let fires = '', arcs = '', smoke = '';
  hills.forEach((h, i) => {
    const y = top(h), s = 1 - i * .16;
    fires += `<g class="fire" style="--i:${i}"><circle cx="${h.x}" cy="${y - 10 * s}" r="${44 * s}" fill="url(#glow)"/>
      <g transform="translate(${h.x} ${y + 2}) scale(${s})"><path class="fl" d="M0 0 C-14 -8 -12 -26 -2 -46 C0 -34 6 -30 6 -38 C14 -24 14 -8 0 0 Z" fill="url(#flame)"/></g></g>`;
    for (let j = 0; j < 3; j++) smoke += `<circle class="sm" style="--i:${i};--j:${j}" cx="${h.x + 4}" cy="${y - 50 * s}" r="${11 * s}" fill="rgba(225,225,220,.55)"/>`;
    if (i < hills.length - 1) {
      const n = hills[i + 1], y2 = top(n), mx = (h.x + n.x) / 2, my = Math.min(y, y2) - 80;
      arcs += `<path class="arc" style="--i:${i}" d="M${h.x + 14} ${y - 30} Q${mx} ${my} ${n.x - 10} ${y2 - 24}" fill="none" stroke="#FFD27A" stroke-width="4" stroke-linecap="round"/>`;
    }
  });
  const stars = Array.from({ length: 26 }, (_, k) => `<circle cx="${(k * 137) % 900}" cy="${(k * 61) % 170 + 10}" r="${k % 3 ? 1.4 : 2.2}" fill="#fff" opacity="${k % 2 ? .5 : .8}"/>`).join('');
  return `<div class="svgc bc"><svg viewBox="0 0 900 560" aria-label="Сигнальные костры на вершинах">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16202D"/><stop offset=".55" stop-color="#4A4560"/><stop offset=".86" stop-color="#C47F55"/><stop offset="1" stop-color="#E7A465"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset=".45" stop-color="#FF9A3C" stop-opacity=".45"/><stop offset="1" stop-color="#FF7A1A" stop-opacity="0"/></radialGradient>
    <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF6A1A"/><stop offset=".6" stop-color="#FFB13B"/><stop offset="1" stop-color="#FFF1B0"/></linearGradient>
  </defs>
  <rect width="900" height="560" fill="url(#sky)"/>${stars}
  ${hills.slice().reverse().map(h => `<path d="${cone(h.x, G, h.h, h.w)}" fill="${h.c}"/>`).join('')}
  <rect x="0" y="${G - 1}" width="900" height="${560 - G + 1}" fill="#1D2618"/>
  ${arcs}${smoke}${fires}
  <text x="30" y="58" fill="#fff" style="font:700 34px var(--f)">Днём дым, ночью огонь</text>
  <text x="30" y="96" fill="#fff" opacity=".85" style="font:italic 400 25px var(--f)">весть идёт от горы к горе</text>
  <text x="${hills[0].x}" y="${G + 52}" fill="#fff" text-anchor="middle" style="font:700 30px var(--f)">Сусак-тау</text>
  <text x="${(hills[1].x + hills[3].x) / 2}" y="${G + 52}" fill="#fff" opacity=".8" text-anchor="middle" style="font:italic 400 26px var(--f)">соседние дозорные горы</text>
</svg></div>`;
}

/* Сусак-тау в разрезе: четыре слоя работы снизу вверх */
function layersSvg() {
  const mt = 'M20 600 C190 598 268 330 300 72 C332 330 410 598 580 600 Z';
  const B = [
    { k: 'l1', y0: 470, y1: 600, x: 451, n: 'Природа', d: ['памятник природы,', 'редкие растения'] },
    { k: 'l2', y0: 360, y1: 470, x: 382, n: 'Археология', d: ['бронзовый век,', 'сарматы'] },
    { k: 'l3', y0: 250, y1: 360, x: 343, n: 'Хозяйство', d: ['Туктаровская', 'мельница'] },
    { k: 'l4', y0: 60, y1: 250, x: 314, n: 'Культура', d: ['«Урал-батыр»,', 'клип AY YOLA'] }
  ];
  const pats = B.map(b => `<pattern id="lh-${b.k}" width="10" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5H10" stroke="${L[b.k].c}" stroke-width="2"/></pattern>`).join('');
  const bands = B.map((b, i) => `<g class="band" style="--i:${i}"><rect x="0" y="${b.y0}" width="600" height="${b.y1 - b.y0}" fill="${L[b.k].tint}"/><rect x="0" y="${b.y0}" width="600" height="${b.y1 - b.y0}" fill="url(#lh-${b.k})"/><rect x="0" y="${b.y0 - 2}" width="600" height="4" fill="#fff"/></g>`).join('');
  const labs = B.map((b, i) => {
    const ym = (b.y0 + b.y1) / 2 + (b.k === 'l4' ? 40 : 0);
    return `<g class="lab" style="--i:${i}"><circle cx="${b.x - 6}" cy="${ym}" r="6" fill="${L[b.k].o}"/><path d="M${b.x - 6} ${ym} H612" stroke="${L[b.k].o}" stroke-width="2.5"/>
      <text x="624" y="${ym - 4}" fill="${L[b.k].o}" style="font:700 34px var(--f)">${b.n}</text>
      <text x="624" y="${ym + 26}" fill="#1F2B22" style="font:400 23px var(--f)">${b.d[0]}</text>
      <text x="624" y="${ym + 52}" fill="#1F2B22" style="font:400 23px var(--f)">${b.d[1]}</text></g>`;
  }).join('');
  return `<div class="svgc ly"><svg viewBox="0 0 900 650" aria-label="Четыре слоя горы Сусак-тау">
  <defs>${pats}<clipPath id="lyClip"><path d="${mt}"/></clipPath></defs>
  <rect width="900" height="650" rx="22" fill="rgba(255,255,255,.96)"/>
  <text x="34" y="52" fill="#5E6B5F" style="font:italic 400 24px var(--f)">Сусак-тау в разрезе работы</text>
  <g clip-path="url(#lyClip)">${bands}</g>
  <path d="${mt}" fill="none" stroke="#1F2B22" stroke-width="3" stroke-linejoin="round"/>
  ${labs}
</svg></div>`;
}

/* гора-останец: мягкие породы вокруг уходят, твёрдое ядро остаётся */
function erosionSvg() {
  const c = L.l1;
  return `<svg viewBox="0 0 600 168" aria-label="Как появилась гора-останец">
  <defs><pattern id="eh" width="9" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H9" stroke="${c.c}" stroke-width="1.8"/></pattern></defs>
  <g class="soft"><rect x="8" y="38" width="584" height="112" rx="4" fill="#E9DCB8"/><text x="28" y="104" fill="#8A7650" style="font:italic 400 22px var(--f)">мягкие породы</text></g>
  <path d="M8 38 H592" stroke="#8A7650" stroke-width="2" stroke-dasharray="9 8"/>
  <text x="12" y="27" fill="#5E6B5F" style="font:italic 400 19px var(--f)">прежняя поверхность</text>
  <path d="M200 150 C258 148 288 104 300 42 C312 104 342 148 400 150 Z" fill="#fff"/><path d="M200 150 C258 148 288 104 300 42 C312 104 342 148 400 150 Z" fill="url(#eh)" stroke="${c.o}" stroke-width="2.4"/>
  <text x="414" y="138" fill="${c.o}" style="font:700 21px var(--f)">твёрдые породы</text>
  <path d="M4 150 H596" stroke="#1F2B22" stroke-width="2.5"/>
</svg>`;
}

/* ---------- слайды ---------- */
function mediaHtml(m) {
  if (!m) return '';
  if (m.type === 'photo') return `<figure class="ph${m.frame ? ' frame' : ''}"><div class="kb"><img src="${m.src}" alt="${esc(m.cap)}" style="object-position:${m.pos || '50% 50%'}"></div><figcaption>${m.cap}</figcaption></figure>`;
  if (m.type === 'map') return `<figure class="mapc">${mapSvg()}${legendHtml()}<figcaption>Рельеф Mapzen, объекты © OpenStreetMap. Мельница, Туктарово и находка показаны примерно</figcaption></figure>`;
  if (m.type === 'plants') return `<div class="plants pg"><h3>Красная книга · растения склонов</h3><ol>${PLANTS.map(([n, l, , img, cr], k) => `<li style="--d:${k}">${img ? `<span class="pi kb"><img src="${img}" alt="${esc(n)}"></span>` : '<span class="pi none">снимка вида в открытых источниках нет</span>'}<b>${n}</b><i>${l}</i>${cr ? `<small>фото: ${cr}</small>` : ''}</li>`).join('')}</ol><p class="src">Список видов: статья «Сусактау», Википедия [2]. Фото показывают вид, сняты не на Сусак-тау</p></div>`;
  if (m.type === 'trip') return `<div class="trip">
    <figure class="t1" style="--d:0"><div class="kb"><img src="img/liza-vershina.jpg" alt="Елизавета на вершине Сусак-тау" style="object-position:50% 45%"></div><figcaption>На вершине</figcaption></figure>
    <figure class="t2" style="--d:1"><div class="kb"><img src="img/liza-rebyata.jpg" alt="Елизавета с ребятами на склоне" style="object-position:35% 60%"></div><figcaption>С ребятами на склоне, внизу Дёма</figcaption></figure>
    <figure class="t3" style="--d:2"><div class="kb"><img src="img/gruppa.jpg" alt="Общее фото на горе" style="object-position:50% 55%"></div><figcaption>Общее фото на горе</figcaption></figure></div>`;
  if (m.type === 'finds') return `<div class="finds">
    <figure class="f1" style="--d:0"><div class="kb"><img src="img/topor.jpg" alt="Бронзовый топор"></div><figcaption>Бронзовый топор</figcaption></figure>
    <figure class="f2" style="--d:1"><div class="kb"><img src="img/serp.jpg" alt="Бронзовый серп"></div><figcaption>Бронзовый серп</figcaption></figure>
    <figure class="f3" style="--d:2"><div class="kb"><img src="img/mesto-nakhodki.jpg" alt="Место находки на снимке со спутника"></div><figcaption>Место находки в кольце. Снимок со спутника</figcaption></figure></div>`;
  if (m.type === 'beacons') return beaconsSvg();
  if (m.type === 'layers') return layersSvg();
  if (m.type === 'chain') return `<div class="chain">
    <div class="cn" style="--d:0"><b>Эпос</b><span>«Урал-батыр», народное сказание</span></div><i class="ar" style="--d:1"></i>
    <div class="cn" style="--d:2"><b>1910</b><span>Мухаметша Бурангулов записал эпос от сэсэнов</span></div><i class="ar" style="--d:3"></i>
    <div class="cn" style="--d:4"><b>2025</b><span>AY YOLA, песня и клип «Ural Vasyaty»</span></div><i class="ar" style="--d:5"></i>
    <div class="cn last" style="--d:6"><b>Сусак-тау</b><span>одна из главных локаций съёмок</span></div></div>`;
  if (m.type === 'scatter') {
    const F = [['эпос «Урал-батыр»', 'l4', 46, -1.5, -10, -13, -10], ['водяная мельница', 'l3', 58, -.5, 9, -4, 8], ['находки бронзового века', 'l2', 70, .5, -7, 6, -6], ['памятник природы', 'l1', 82, 1.5, 5, 14, 5]];
    return `<div class="scatter"><div class="peak">${peakSvg('#1F2B22', '#fff')}</div>${F.map(([t, k, w, y1, x0, y0, r0], i) => `<span class="frag" style="--d:${i};--c:${L[k].c};--w:${w}%;--y1:calc(var(--u)*${y1 * 5});--x0:calc(var(--u)*${x0});--y0:calc(var(--u)*${y0});--r0:${r0}deg">${t}</span>`).join('')}<p class="sc-t">Одна гора, одна картина</p></div>`;
  }
  return '';
}

function slideHtml(s, i) {
  const ly = L[s.layer], st = lyStyle(s.layer);
  if (s.layout === 'title') return `<section class="slide title" data-i="${i}" style="${st}" aria-label="Слайд ${i + 1}">
    <div class="tcard"><p class="kick" style="--d:0">«Отечество» · 2026 · номинация «${M.nomination}»</p>
    <h1 style="--d:1">${M.title}</h1>
    <div class="who" style="--d:2"><p><b>${M.author}</b>, ${M.grade}</p>${M.supervisors.map((x, k) => `<p>${k ? '' : 'Руководители: '}${x}</p>`).join('')}</div></div></section>`;
  if (s.layout === 'final') return `<section class="slide final" data-i="${i}" style="${st}" aria-label="Слайд ${i + 1}">
    <div class="fcard"><p class="kick" style="--d:0"><i></i>${s.kicker}</p><div class="fcols">${s.cols.map(([h, items], k) => `<div style="--d:${k + 1}"><h3>${h}</h3><ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div></div>
    <p class="thanks" style="--d:3">${s.thanks}</p></section>`;
  let d = 0; const D = () => `style="--d:${d++}"`;
  let t = `<p class="kick" ${D()}><i></i>${s.kicker || ly.name}</p><h2 ${D()}>${s.h}</h2>`;
  if (s.points) t += `<ul class="pts">${s.points.map(p => `<li ${D()}>${p}</li>`).join('')}</ul>`;
  if (s.timeline) t += `<ol class="tl">${s.timeline.map(([y, x]) => `<li ${D()}><b>${y}</b><span>${x}</span></li>`).join('')}</ol>`;
  if (s.stats) t += `<div class="stats" ${D()}>${s.stats.map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>`;
  if (s.erosion) t += `<div class="eros" ${D()}>${erosionSvg()}</div>`;
  if (s.chips) t += `<div class="chips" ${D()}><span class="cl">${s.chipsLabel}:</span>${s.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>`;
  if (s.note) t += `<p class="note" ${D()}>${s.note}</p>`;
  return `<section class="slide" data-i="${i}" style="${st}" aria-label="Слайд ${i + 1}"><div class="txt">${t}</div><div class="media">${mediaHtml(s.media)}</div></section>`;
}

const host = $('#slides'), tiles = $('#tiles'), bar = $('#bar'), stage = $('#stage');
host.innerHTML = S.map(slideHtml).join('');
tiles.innerHTML = S.map((s, i) => `<button class="mc" type="button" data-i="${i}" style="${lyStyle(s.layer)}" title="${i + 1}. ${esc(s.tab)}"><span class="art">${plaqueSvg(i)}</span><span class="tx"><small>${pad(i + 1)}</small><b>${s.tab}</b></span></button>`).join('');
tiles.style.setProperty('--n', S.length);
const slides = [...host.children], plaques = [...tiles.children];

/* ---------- фон: ролики с дрона, смена наплывом ---------- */
const vids = [$('#va'), $('#vb')], ORDER = ['v1', 'v2', 'v3'];
/* телефоны и планшеты берут ролики 720p, ноутбук с проектором 1080p */
const Q = Math.max(screen.width, screen.height) <= 1100 ? '-720' : '';
let cur = 0, tok = 0, cycling = false;
function playClip(clip, t) {
  const my = ++tok, nv = vids[1 - cur], ov = vids[cur];
  const show = () => {
    if (my !== tok) return;
    nv.play().catch(() => {});
    nv.classList.add('on'); ov.classList.remove('on');
    cur = vids.indexOf(nv);
    setTimeout(() => { if (my === tok) ov.pause(); }, 1300);
  };
  const seek = () => {
    if (my !== tok) return;
    nv.addEventListener('seeked', show, { once: true });
    try { nv.currentTime = Math.min(t, (nv.duration || 999) - 2); } catch (e) { show(); }
  };
  if (nv.dataset.clip !== clip) {
    nv.dataset.clip = clip; nv.src = `video/${clip}${Q}.mp4`; nv.poster = `video/${clip}.jpg`;
    nv.addEventListener('loadedmetadata', seek, { once: true }); nv.load();
  } else if (nv.readyState >= 1) seek();
  else nv.addEventListener('loadedmetadata', seek, { once: true });
}
vids.forEach(v => {
  v.muted = true;
  v.addEventListener('timeupdate', () => {
    if (v !== vids[cur] || cycling || !v.duration) return;
    if (v.duration - v.currentTime < 1.3) {
      cycling = true; setTimeout(() => { cycling = false; }, 2600);
      playClip(ORDER[(ORDER.indexOf(v.dataset.clip) + 1) % ORDER.length], 0);
    }
  });
});

/* ---------- переход по слайдам ---------- */
let idx = -1, started = false;
const seen = new Set();
const chip = $('#layerChip'), count = $('#count'), notes = $('#notes');
function go(i, force) {
  i = Math.max(0, Math.min(S.length - 1, i));
  if (i === idx && !force) return;
  idx = i; seen.add(i);
  slides.forEach((el, k) => el.classList.toggle('on', k === i));
  plaques.forEach((el, k) => { el.classList.toggle('cur', k === i); el.classList.toggle('seen', seen.has(k)); });
  /* на телефоне плашки листаются лентой: текущая встаёт в середину */
  if (tiles.scrollWidth > tiles.clientWidth + 4) {
    const p = plaques[i];
    tiles.scrollTo({ left: p.offsetLeft - tiles.clientWidth / 2 + p.offsetWidth / 2, behavior: 'smooth' });
  }
  const s = S[i];
  stage.setAttribute('style', lyStyle(s.layer));
  chip.textContent = L[s.layer].name;
  count.textContent = `${pad(i + 1)} / ${S.length}`;
  if (!notes.hidden) fillNotes();
  playClip(s.clip, s.t);
  try { history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
}
function fillNotes() {
  const s = S[idx], words = s.say.split(/\s+/).length;
  notes.innerHTML = `<h4>Слайд ${idx + 1} · ${s.tab} · около ${Math.round(words / 2.1)} с</h4><p>${s.say}</p>`;
}

/* ---------- таймер выступления ---------- */
const timer = $('#timer'); let t0 = null;
setInterval(() => {
  if (t0 === null) return;
  const s = Math.floor((Date.now() - t0) / 1000);
  timer.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
  timer.classList.toggle('warn', s >= M.limitSec - 60 && s < M.limitSec);
  timer.classList.toggle('over', s >= M.limitSec);
}, 250);

function fullscreen(on) {
  const d = document;
  if (on === undefined) on = !d.fullscreenElement;
  if (on && !d.fullscreenElement) d.documentElement.requestFullscreen?.().catch(() => {});
  if (!on && d.fullscreenElement) d.exitFullscreen?.().catch(() => {});
}
function start() {
  started = true; stage.classList.add('started');
  seen.clear(); t0 = Date.now(); timer.classList.add('run');
  fullscreen(true);
  go(0, true);
}

/* ---------- кнопки, плашки, клавиши ---------- */
const click = (el, fn) => el.addEventListener('click', e => { fn(e); el.blur(); });
click($('#bStart'), start);
click($('#bPrev'), () => go(idx - 1));
click($('#bNext'), () => go(idx + 1));
plaques.forEach(p => click(p, () => go(+p.dataset.i)));
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key, c = e.code;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); go(idx + 1); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(idx - 1); }
  else if (k === 'Home') { e.preventDefault(); go(0); }
  else if (k === 'End') { e.preventDefault(); go(S.length - 1); }
  else if (c === 'KeyF') fullscreen();
  else if (c === 'KeyT') { notes.hidden = !notes.hidden; if (!notes.hidden) fillNotes(); }
  else if (c === 'Escape' && !notes.hidden) notes.hidden = true;
});

/* листание свайпом на телефоне и колёсиком мыши */
let sx = null, sy = null;
stage.addEventListener('touchstart', e => {
  if (e.target.closest('.tiles, .notes')) { sx = null; return; }
  const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY;
}, { passive: true });
stage.addEventListener('touchend', e => {
  if (sx === null) return;
  const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(idx + (dx < 0 ? 1 : -1));
}, { passive: true });
let wheelT = 0;
stage.addEventListener('wheel', e => {
  if (e.target.closest('.tiles, .notes')) return;
  const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(d) < 25 || Date.now() - wheelT < 800) return;
  wheelT = Date.now(); go(idx + (d > 0 ? 1 : -1));
}, { passive: true });

/* курсор прячется, если мышь не двигается (в полноэкранном режиме) */
let idleT;
addEventListener('mousemove', () => {
  stage.classList.remove('idle'); clearTimeout(idleT);
  idleT = setTimeout(() => { if (document.fullscreenElement) stage.classList.add('idle'); }, 2500);
});

/* ---------- подгонка: высота панели, размер текста в карточках, подложки подписей на схеме ---------- */
function fit() {
  document.documentElement.style.setProperty('--barH', bar.offsetHeight + 'px');
  host.querySelectorAll('.txt').forEach(el => {
    let k = 1; el.style.setProperty('--k', k);
    while (el.scrollHeight > el.clientHeight + 2 && k > .62) { k -= .03; el.style.setProperty('--k', k.toFixed(2)); }
  });
  host.querySelectorAll('.mapc .pl').forEach(g => {
    const t = g.querySelector('text'), r = g.querySelector('rect'), b = t.getBBox();
    r.setAttribute('x', b.x - 9); r.setAttribute('y', b.y - 3); r.setAttribute('width', b.width + 18); r.setAttribute('height', b.height + 6);
  });
  /* видимая часть схемы подстраивается под экран (16:9 или 4:3), чтобы все отметки помещались;
     масштаб и стрелка севера держатся в углах */
  host.querySelectorAll('.mapc').forEach(fig => {
    const svg = fig.querySelector('svg'), W = fig.clientWidth, H = fig.clientHeight; if (!W || !H) return;
    const C = { x: 690, y: 140, w: 740, h: 760 }, A = W / H;
    let w, h, x, y;
    if (A > C.w / C.h) { h = C.h; w = h * A; } else { w = C.w; h = w / A; }
    w = Math.min(w, 1600); h = Math.min(h, 1000);
    x = Math.max(0, Math.min(1600 - w, C.x + C.w / 2 - w / 2)); y = Math.max(0, Math.min(1000 - h, C.y + C.h / 2 - h / 2));
    svg.setAttribute('viewBox', `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    const u = w / W, cap = fig.querySelector('figcaption').offsetHeight * u;
    svg.querySelector('.scale').setAttribute('transform', `translate(${(x + 34).toFixed(1)} ${(y + h - cap - 32).toFixed(1)})`);
    svg.querySelector('.north').setAttribute('transform', `translate(${(x + w - 46).toFixed(1)} ${(y + 60).toFixed(1)})`);
  });
}
addEventListener('resize', fit);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
fit();

const h = parseInt(location.hash.slice(1), 10);
go(h >= 1 && h <= S.length ? h - 1 : 0, true);
})();
