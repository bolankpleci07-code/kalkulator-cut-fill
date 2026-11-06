const $ = id => document.getElementById(id);
const n = v => Number(v) || 0;
const fmt = v => n(v).toLocaleString('id-ID', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

let grid = [];
let sections = [];
let gridResult = { cut: 0, fill: 0, area: 0 };
let secResult = { cut: 0, fill: 0 };

function tab(id) {
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('active', p.id === id)
  );

  document.querySelectorAll('.tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === id)
  );

  if (id === 'surface') drawSurface();
  if (id === 'report') updateReport();
}

document.querySelectorAll('.tab').forEach(b => {
  b.onclick = () => tab(b.dataset.tab);
});

function buildGrid(rows, cols, eg, fg) {
  grid = [];
  let k = 0;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      grid.push({
        id: `P${++k}`,
        x: i * n($('spacingX').value),
        y: j * n($('spacingY').value),
        eg: eg?.[j]?.[i] ?? 100,
        fg: fg?.[j]?.[i] ?? n($('design').value)
      });
    }
  }

  renderGrid();
}

function renderGrid() {
  const tb = $('gridTable').querySelector('tbody');
  tb.innerHTML = '';

  grid.forEach((p, i) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${fmt(p.x)}</td>
      <td>${fmt(p.y)}</td>
      <td>
        <input aria-label="EG ${p.id}" type="number"
          step=".001" value="${p.eg}" data-i="${i}" data-k="eg">
      </td>
      <td>
        <input aria-label="FG ${p.id}" type="number"
          step=".001" value="${p.fg}" data-i="${i}" data-k="fg">
      </td>
      <td>${fmt(p.eg - p.fg)}</td>
    `;

    tb.appendChild(tr);
  });

  tb.querySelectorAll('input').forEach(inp => {
    inp.onchange = () => {
      grid[n(inp.dataset.i)][inp.dataset.k] = n(inp.value);
      renderGrid();
    };
  });
}

$('makeGrid').onclick = () => {
  const r = Math.max(2, Math.min(40, parseInt($('rows').value) || 2));
  const c = Math.max(2, Math.min(40, parseInt($('cols').value) || 2));

  $('rows').value = r;
  $('cols').value = c;

  buildGrid(r, c);
};

$('sampleGrid').onclick = () => {
  const eg = [
    [101.2, 100.8, 100.1],
    [100.9, 100.4, 99.8],
    [100.2, 99.9, 99.5]
  ];

  const fg = [
    [100, 100, 100],
    [100, 100, 100],
    [100, 100, 100]
  ];

  $('rows').value = 3;
  $('cols').value = 3;
  $('spacingX').value = 10;
  $('spacingY').value = 10;

  buildGrid(3, 3, eg, fg);
  calculateGrid();
};

function calculateGrid() {
  if (grid.length < 4) {
    alert('Buat grid minimal 2 × 2.');
    return;
  }

  const rows = parseInt($('rows').value);
  const cols = parseInt($('cols').value);
  const dx = n($('spacingX').value);
  const dy = n($('spacingY').value);

  if (dx <= 0 || dy <= 0) {
    alert('Jarak grid harus lebih dari nol.');
    return;
  }

  let cut = 0;
  let fill = 0;

  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const ids = [
        j * cols + i,
        j * cols + i + 1,
        (j + 1) * cols + i,
        (j + 1) * cols + i + 1
      ];

      if (ids.some(k => !grid[k])) continue;

      const d = ids.reduce(
        (s, k) => s + grid[k].eg - grid[k].fg,
        0
      ) / 4;

      const v = Math.abs(d) * dx * dy;

      if (d > 0) cut += v;
      else fill += v;
    }
  }

  gridResult = {
    cut,
    fill,
    area: (cols - 1) * dx * (rows - 1) * dy
  };

  $('gridCut').textContent = fmt(cut);
  $('gridFill').textContent = fmt(fill);
  $('gridNet').textContent = fmt(cut - fill);
  $('gridArea').textContent = fmt(gridResult.area);

  updateReport();
}

$('calcGrid').onclick = calculateGrid;

function renderSections() {
  const tb = $('sectionTable').querySelector('tbody');
  tb.innerHTML = '';

  sections.sort((a, b) => a.sta - b.sta);

  sections.forEach((s, i) => {
    const d = i < sections.length - 1
      ? sections[i + 1].sta - s.sta
      : 0;

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${fmt(s.sta)}</td>
      <td>${fmt(s.cut)}</td>
      <td>${fmt(s.fill)}</td>
      <td>${fmt(d)}</td>
      <td><button class="danger" data-del="${i}">Hapus</button></td>
    `;

    tb.appendChild(tr);
  });

  tb.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = () => {
      sections.splice(n(b.dataset.del), 1);
      renderSections();
      calcSections();
    };
  });
}

$('addSection').onclick = () => {
  const sta = n($('sta').value);

  if (sections.some(s => s.sta === sta)) {
    alert('STA sudah ada.');
    return;
  }

  sections.push({
    sta,
    cut: Math.max(0, n($('areaCut').value)),
    fill: Math.max(0, n($('areaFill').value))
  });

  renderSections();
  calcSections();

  $('sta').value = sta + n($('sectionSpacing').value);
};

$('sampleSections').onclick = () => {
  sections = [
    { sta: 0, cut: 12, fill: 3 },
    { sta: 10, cut: 18, fill: 5 },
    { sta: 20, cut: 10, fill: 8 },
    { sta: 30, cut: 4, fill: 12 }
  ];

  renderSections();
  calcSections();
};

function calcSections() {
  sections.sort((a, b) => a.sta - b.sta);

  let cut = 0;
  let fill = 0;

  for (let i = 0; i < sections.length - 1; i++) {
    const L = sections[i + 1].sta - sections[i].sta;

    if (L < 0) continue;

    cut += (sections[i].cut + sections[i + 1].cut) / 2 * L;
    fill += (sections[i].fill + sections[i + 1].fill) / 2 * L;
  }

  secResult = { cut, fill };

  $('secCut').textContent = fmt(cut);
  $('secFill').textContent = fmt(fill);
  $('secNet').textContent = fmt(cut - fill);
  $('secCount').textContent = sections.length;

  updateReport();
}

function updateReport() {
  const cut = gridResult.cut + secResult.cut;
  const fill = gridResult.fill + secResult.fill;

  $('totalCut').textContent = fmt(cut);
  $('totalFill').textContent = fmt(fill);
  $('totalNet').textContent = fmt(cut - fill);

  $('methodLabel').textContent =
    (grid.length ? 'Grid' : '') +
    (grid.length && sections.length ? ' + ' : '') +
    (sections.length ? 'Section' : '') ||
    'Belum dihitung';

  $('reportMeta').textContent =
    `Proyek: ${$('projectName').value} · ` +
    `Lokasi: ${$('location').value || '-'} · ` +
    `Grid ${fmt(gridResult.area)} m² · ` +
    `${sections.length} section`;
}

function drawSurface() {
  const c = $('surfaceCanvas');
  const ctx = c.getContext('2d');
  const w = c.width;
  const h = c.height;

  ctx.clearRect(0, 0, w, h);

  if (grid.length < 4) {
    ctx.fillStyle = '#65756f';
    ctx.font = '18px sans-serif';
    ctx.fillText('Belum ada data grid', 30, 50);
    return;
  }

  const rows = parseInt($('rows').value);
  const cols = parseInt($('cols').value);
  const mode = $('surfaceMode').value;
  const view = $('surfaceView').value;

  const vals = grid.map(p =>
    mode === 'eg' ? p.eg :
    mode === 'fg' ? p.fg :
    p.eg - p.fg
  );

  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const range = mx - mn || 1;

  const project = (i, j, z) => {
    const zz = (z - mn) / range * 100;

    if (view === 'top') {
      return [
        90 + i * (w - 180) / (cols - 1),
        70 + j * (h - 140) / (rows - 1)
      ];
    }

    return [
      w / 2 + (i - j) * (w * .32 / Math.max(cols, rows)),
      h * .62 + (i + j) * (h * .19 / Math.max(rows, cols)) - zz * 1.4
    ];
  };

  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const ps = [
        [j * cols + i, i, j],
        [j * cols + i + 1, i + 1, j],
        [(j + 1) * cols + i + 1, i + 1, j + 1],
        [(j + 1) * cols + i, i, j + 1]
      ].map(([k, x, y]) => project(x, y, vals[k]));

      const z = ps.reduce((s, p) => s + p[1], 0) / 4;

      ctx.beginPath();
      ctx.moveTo(...ps[0]);
      ps.slice(1).forEach(p => ctx.lineTo(...p));
      ctx.closePath();

      const shade = Math.max(
        0,
        Math.min(255, Math.round(90 + (z / h) * 100))
      );

      ctx.fillStyle = mode === 'diff'
        ? (vals[j * cols + i] >= 0
          ? 'rgba(192,94,72,.48)'
          : 'rgba(67,133,178,.48)')
        : `rgba(70,${shade},110,.55)`;

      ctx.fill();
      ctx.strokeStyle = '#4b6b60';
      ctx.stroke();
    }
  }

  grid.forEach((p, k) => {
    const i = k % cols;
    const j = Math.floor(k / cols);
    const pt = project(i, j, vals[k]);

    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
    ctx.fillStyle = '#173f32';
    ctx.fill();

    ctx.fillStyle = '#263a33';
    ctx.font = '12px sans-serif';
    ctx.fillText(fmt(vals[k]), pt[0] + 6, pt[1] - 6);
  });

  $('surfaceInfo').textContent =
    `${mode.toUpperCase()} · rentang elevasi ` +
    `${fmt(mn)} sampai ${fmt(mx)} · ${grid.length} titik`;
}

$('drawSurface').onclick = drawSurface;
$('surfaceMode').onchange = drawSurface;
$('surfaceView').onchange = drawSurface;

$('exportCsv').onclick = () => {
  const lines = [
    ['CUT & FILL V6.0'],
    ['Proyek', $('projectName').value],
    ['Lokasi', $('location').value],
    [],
    ['REKAP', 'Volume m3'],
    ['Grid Cut', gridResult.cut],
    ['Grid Fill', gridResult.fill],
    ['Section Cut', secResult.cut],
    ['Section Fill', secResult.fill],
    ['Total Cut', gridResult.cut + secResult.cut],
    ['Total Fill', gridResult.fill + secResult.fill],
    [
      'Net',
      gridResult.cut + secResult.cut -
      gridResult.fill - secResult.fill
    ],
    [],
    ['GRID', 'X', 'Y', 'EG', 'FG', 'Delta']
  ];

  grid.forEach(p => {
    lines.push([
      p.id, p.x, p.y, p.eg, p.fg, p.eg - p.fg
    ]);
  });

  lines.push([], ['SECTION', 'Area Cut', 'Area Fill']);

  sections.forEach(s => {
    lines.push([s.sta, s.cut, s.fill]);
  });

  const csv = lines.map(r =>
    r.map(v =>
      '"' + String(v ?? '').replaceAll('"', '""') + '"'
    ).join(';')
  ).join('\r\n');

  const blob = new Blob(
    ['\ufeff' + csv],
    { type: 'text/csv;charset=utf-8;' }
  );

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'laporan-cut-fill-v6.csv';
  a.click();

  URL.revokeObjectURL(a.href);
};

$('printReport').onclick = () => window.print();

$('resetAll').onclick = () => {
  if (confirm('Hapus seluruh data perhitungan?')) {
    grid = [];
    sections = [];
    gridResult = { cut: 0, fill: 0, area: 0 };
    secResult = { cut: 0, fill: 0 };

    renderGrid();
    renderSections();
    calculateGrid();
    calcSections();
    drawSurface();
  }
};

buildGrid(3, 3);
renderSections();
updateReport();
