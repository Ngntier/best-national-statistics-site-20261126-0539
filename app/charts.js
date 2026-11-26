/* NusaData chart helpers.
   Every chart is plain inline SVG drawn by these functions — no chart
   library, no network, nothing fetched. All functions take plain data
   and return an SVG string; the views in app.js place the result. */

var CHART = (function () {
  const INK = '#23403f';
  const GRID = '#e3ddd0';
  const TEAL = '#0f6a63';
  const TEAL_SOFT = '#7fb8b1';
  const CORAL = '#d96f3c';
  const SAND = '#e8b64c';
  const SLATE = '#5d7a78';

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function fmt(value, decimals) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    });
  }

  /* Nice axis ticks: round the data range out to tidy steps. */
  function ticksFor(min, max, count) {
    if (max === min) max = min + 1;
    const span = max - min;
    const raw = span / (count - 1);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = norm < 1.5 ? mag : norm < 3.5 ? 2 * mag : norm < 7.5 ? 5 * mag : 10 * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const out = [];
    for (let v = lo; v <= hi + step / 2; v += step) out.push(v);
    return { lo, hi, step, values: out };
  }

  function axisLabels(values, decimals) {
    return values.map(function (v) { return fmt(v, decimals); });
  }

  /* Line chart with points, gridlines and year labels.
     points: [{year, value}], opts: {height, color, unit, decimals, area} */
  function lineChart(points, opts) {
    const o = opts || {};
    const w = 640, h = o.height || 260;
    const padL = 52, padR = 14, padT = 14, padB = 30;
    const vals = points.map(function (p) { return p.value; });
    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const pad = (max - min) * 0.12 || 1;
    const t = ticksFor(min - pad, max + pad, 5);
    const x = function (i) { return padL + (i * (w - padL - padR)) / (points.length - 1); };
    const y = function (v) { return padT + ((t.hi - v) * (h - padT - padB)) / (t.hi - t.lo); };
    let s = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Line chart">';
    t.values.forEach(function (v) {
      s += '<line x1="' + padL + '" y1="' + y(v) + '" x2="' + (w - padR) + '" y2="' + y(v) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + (padL - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="' + SLATE + '">' + esc(fmt(v, o.decimals || 0)) + '</text>';
    });
    if (o.area) {
      let area = 'M' + x(0) + ',' + y(points[0].value);
      points.forEach(function (p, i) { area += ' L' + x(i) + ',' + y(p.value); });
      area += ' L' + x(points.length - 1) + ',' + (h - padB) + ' L' + x(0) + ',' + (h - padB) + ' Z';
      s += '<path d="' + area + '" fill="' + (o.color || TEAL) + '" fill-opacity="0.10"/>';
    }
    let path = 'M' + x(0) + ',' + y(points[0].value);
    points.forEach(function (p, i) { path += ' L' + x(i) + ',' + y(p.value); });
    s += '<path d="' + path + '" fill="none" stroke="' + (o.color || TEAL) + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    points.forEach(function (p, i) {
      s += '<circle cx="' + x(i) + '" cy="' + y(p.value) + '" r="3.5" fill="#fff" stroke="' + (o.color || TEAL) + '" stroke-width="2"/>';
      s += '<text x="' + x(i) + '" y="' + (h - 10) + '" text-anchor="middle" font-size="11" fill="' + SLATE + '">' + p.year + '</text>';
    });
    const last = points[points.length - 1];
    s += '<text x="' + x(points.length - 1) + '" y="' + (y(last.value) - 10) + '" text-anchor="end" font-size="12" font-weight="700" fill="' + INK + '">' + esc(fmt(last.value, o.decimals || 0)) + (o.unit ? ' ' + esc(o.unit) : '') + '</text>';
    s += '</svg>';
    return s;
  }

  /* Vertical bar chart. bars: [{label, value}], opts: {height, color, unit, decimals} */
  function barChart(bars, opts) {
    const o = opts || {};
    const w = 640, h = o.height || 260;
    const padL = 52, padR = 14, padT = 26, padB = 30;
    const vals = bars.map(function (b) { return b.value; });
    const min = Math.min(0, Math.min.apply(null, vals));
    const max = Math.max.apply(null, vals);
    const t = ticksFor(min, max, 5);
    const slot = (w - padL - padR) / bars.length;
    const bw = Math.min(46, slot * 0.62);
    const y = function (v) { return padT + ((t.hi - v) * (h - padT - padB)) / (t.hi - t.lo); };
    let s = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Bar chart">';
    t.values.forEach(function (v) {
      s += '<line x1="' + padL + '" y1="' + y(v) + '" x2="' + (w - padR) + '" y2="' + y(v) + '" stroke="' + GRID + '" stroke-width="1"/>';
      s += '<text x="' + (padL - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="' + SLATE + '">' + esc(fmt(v, o.decimals || 0)) + '</text>';
    });
    s += '<line x1="' + padL + '" y1="' + y(0) + '" x2="' + (w - padR) + '" y2="' + y(0) + '" stroke="' + INK + '" stroke-width="1.2"/>';
    bars.forEach(function (b, i) {
      const cx = padL + slot * i + slot / 2;
      const top = y(Math.max(0, b.value));
      const bottom = y(Math.min(0, b.value));
      const color = b.value < 0 ? CORAL : (o.color || TEAL);
      s += '<rect x="' + (cx - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + Math.max(2, bottom - top) + '" rx="3" fill="' + color + '"/>';
      s += '<text x="' + cx + '" y="' + (b.value < 0 ? bottom + 14 : top - 6) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + INK + '">' + esc(fmt(b.value, o.decimals || 0)) + '</text>';
      s += '<text x="' + cx + '" y="' + (h - 10) + '" text-anchor="middle" font-size="11" fill="' + SLATE + '">' + esc(b.label) + '</text>';
    });
    s += '</svg>';
    return s;
  }

  /* Horizontal bar list, best for ranked items like provinces.
     rows: [{label, value, note}], opts: {max, unit, color} */
  function rankBars(rows, opts) {
    const o = opts || {};
    const max = o.max || Math.max.apply(null, rows.map(function (r) { return r.value; }));
    let s = '<div class="rankbars">';
    rows.forEach(function (r) {
      const pct = Math.max(1.5, (r.value / max) * 100);
      s += '<div class="rankbar"><div class="rankbar-label"><span>' + esc(r.label) + '</span><strong>' + esc(fmt(r.value, o.decimals || 0)) + (o.unit ? ' ' + esc(o.unit) : '') + '</strong></div>'
        + '<div class="rankbar-track"><div class="rankbar-fill" style="width:' + pct.toFixed(1) + '%;background:' + (o.color || TEAL) + '"></div></div>'
        + (r.note ? '<div class="rankbar-note">' + esc(r.note) + '</div>' : '') + '</div>';
    });
    s += '</div>';
    return s;
  }

  /* Donut chart with a centre label. slices: [{name, share, color}] */
  function donut(slices, opts) {
    const o = opts || {};
    const size = 220, r = 84, cx = size / 2, cy = size / 2;
    const total = slices.reduce(function (a, s) { return a + s.share; }, 0);
    let a0 = -Math.PI / 2;
    let s = '<svg viewBox="0 0 ' + size + ' ' + size + '" class="donut" role="img" aria-label="Share chart">';
    slices.forEach(function (sl) {
      const a1 = a0 + (sl.share / total) * Math.PI * 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const ri = r - 34;
      const xi1 = cx + ri * Math.cos(a1), yi1 = cy + ri * Math.sin(a1);
      const xi0 = cx + ri * Math.cos(a0), yi0 = cy + ri * Math.sin(a0);
      s += '<path d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ',' + y1.toFixed(1)
        + ' L' + xi1.toFixed(1) + ',' + yi1.toFixed(1) + ' A' + ri + ',' + ri + ' 0 ' + large + ' 0 ' + xi0.toFixed(1) + ',' + yi0.toFixed(1) + ' Z" fill="' + sl.color + '"/>';
      a0 = a1;
    });
    s += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="22" font-weight="700" fill="' + INK + '">' + esc(o.centre || '') + '</text>';
    s += '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="' + SLATE + '">' + esc(o.centreSub || '') + '</text>';
    s += '</svg>';
    s += '<ul class="legend">';
    slices.forEach(function (sl) {
      s += '<li><span class="swatch" style="background:' + sl.color + '"></span><span class="legend-name">' + esc(sl.name) + '</span><strong>' + fmt(sl.share, 1) + '%</strong></li>';
    });
    s += '</ul>';
    return s;
  }

  /* Population pyramid: male bars to the left, female to the right.
     groups: [{band, male, female}] in percent of total population. */
  function pyramid(groups) {
    const w = 640, rowH = 24, padT = 26, padB = 8;
    const h = padT + groups.length * rowH + padB;
    const mid = w / 2;
    const maxV = Math.max.apply(null, groups.map(function (g) { return Math.max(g.male, g.female); }));
    const scale = (mid - 70) / maxV;
    let s = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Population pyramid">';
    s += '<text x="' + (mid - 70) + '" y="16" text-anchor="end" font-size="11" font-weight="700" fill="' + TEAL + '">Men</text>';
    s += '<text x="' + (mid + 70) + '" y="16" font-size="11" font-weight="700" fill="' + CORAL + '">Women</text>';
    groups.forEach(function (g, i) {
      const y = padT + i * rowH;
      const mw = g.male * scale, fw = g.female * scale;
      s += '<rect x="' + (mid - mw) + '" y="' + y + '" width="' + mw + '" height="18" rx="2" fill="' + TEAL + '"/>';
      s += '<rect x="' + mid + '" y="' + y + '" width="' + fw + '" height="18" rx="2" fill="' + CORAL + '"/>';
      s += '<text x="' + mid + '" y="' + (y + 13) + '" text-anchor="middle" font-size="11" fill="' + INK + '">' + esc(g.band) + '</text>';
      if (i % 4 === 0) {
        s += '<text x="' + (mid - mw - 6) + '" y="' + (y + 13) + '" text-anchor="end" font-size="10" fill="' + SLATE + '">' + fmt(g.male, 1) + '%</text>';
        s += '<text x="' + (mid + fw + 6) + '" y="' + (y + 13) + '" font-size="10" fill="' + SLATE + '">' + fmt(g.female, 1) + '%</text>';
      }
    });
    s += '</svg>';
    return s;
  }

  return { esc, fmt, lineChart, barChart, rankBars, donut, pyramid, TEAL, TEAL_SOFT, CORAL, SAND, SLATE };
})();
