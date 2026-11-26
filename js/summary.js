/* Summary (menu 05): one page with Reliability & Cost, Maintenance Calendar and Consumable Inventory.
   Uses the same Calc functions as the other menus. Per-machine figures, cost, price, targets, turnover and accuracy are dummy (js/dummy.js). */
(function () {
var D = window.DemoData, C = window.Calc, X = window.Dummy, ch = {}, ym = null, sel = null;
function $(i) { return document.getElementById(i); }
function e(s) { return X.e(s); }
function nf(n, d) { return n == null || isNaN(n) ? '-' : n.toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
function tile(c, l, v, u) { return '<div class="sm-t sm-' + c + '"><b>' + v + '</b><span>' + l + (u ? ' <i>' + u + '</i>' : '') + '</span></div>'; }
function draw(id, cfg) { if (!window.Chart) return; if (ch[id]) ch[id].destroy(); ch[id] = new Chart($(id), cfg); }
function opt(t) { return { responsive: true, maintainAspectRatio: false, title: { display: true, text: t }, legend: { display: false } }; }
function mno(o) { return String(o.equipmentNo).slice(-5); }
function mach() {
  var f = $('sm-fac').value, l = $('sm-line').value, n = $('sm-no').value, nm = $('sm-nm').value;
  return Object.keys(X.perf).filter(function (k) { var m = X.mc[k]; return m && (!f || m[1] == f) && (!l || m[2] == l) && (!n || k == n) && (!nm || m[0] == nm); });
}
function mm(k) {   /* perf = [Jam Kerja h, Stop Planning h, Breakdown min, Frequency, Consumable Cost Rp]; formulas from the KALKULASI slide */
  var p = X.perf[k], lt = p[0] - p[1], bd = p[2] / 60;
  return { k: k, m: X.mc[k], bd: bd, fr: p[3], ir: bd / lt * 100, mttr: bd / p[3], mtbf: lt / p[3], cost: p[4] };
}
function cal(list) {
  var y = +ym.slice(0, 4), m = +ym.slice(5) - 1, off = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7, dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), by = {}, d, k, i,
    h = '<table class="cal"><tr>' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr><tr>';
  list.forEach(function (o) { (by[o.plannedStart] = by[o.plannedStart] || []).push(o); });
  for (i = 0; i < off; i++) h += '<td class="e"></td>';
  for (d = 1; d <= dim; d++) {
    k = ym + '-' + ('0' + d).slice(-2);
    h += '<td><div class="d">' + d + '</div>' + X.day(by[k] || [], '#1565c0') + '</td>';
    if ((off + d) % 7 === 0 && d < dim) h += '</tr><tr>';
  }
  return h + '</table>';
}
function build(root) {
  var ks = Object.keys(X.perf);
  function u(f) { return ks.map(f).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(); }
  function fill(id, a) { $(id).innerHTML = '<option value="">All</option>' + a.map(function (v) { return '<option value="' + e(v) + '">' + e(v) + '</option>'; }).join(''); $(id).onchange = render; }
  root.innerHTML = '<div class="sm-bar"><label>Factory <select id="sm-fac"></select></label><label>Line <select id="sm-line"></select></label><label>Machine No. <select id="sm-no"></select></label><label>Machine Name <select id="sm-nm"></select></label></div>' +
    '<h3 class="sm-h">1. Reliability &amp; Cost</h3><div class="sm-row" id="sm-k1"></div>' +
    '<div class="sm-row sm-3"><div class="sm-cv"><canvas id="sm-c1"></canvas></div><div class="sm-cv"><canvas id="sm-c2"></canvas></div><div class="sm-cv"><canvas id="sm-c3"></canvas></div></div>' +
    '<div class="sm-row sm-2"><div class="sm-box"><b>Worst Machine</b> (top 5 breakdown time)<div id="sm-w"></div></div><div class="sm-box"><b>Detail Masalah</b><div id="sm-d"></div></div></div>' +
    '<div class="sm-box"><b>Maintenance Performance Detail</b><div class="scroll tall" id="sm-tb"></div></div>' +
    '<h3 class="sm-h">2. Maintenance Schedule</h3><div class="sm-row" id="sm-k2"></div>' +
    '<div class="sm-box"><div class="cal-bar"><button class="ib" id="sm-prev" aria-label="Previous month"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b id="sm-ct"></b><button class="ib" id="sm-next" aria-label="Next month"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div><div id="sm-cal"></div></div>' +
    '<h3 class="sm-h">3. Consumable Inventory Spare Part</h3><div class="sm-row" id="sm-k3"></div>' +
    '<div class="sm-row sm-2"><div class="sm-cv"><canvas id="sm-c4"></canvas></div><div class="sm-cv"><canvas id="sm-c5"></canvas></div></div>' +
    '<div class="sm-row sm-2"><div class="sm-box"><b>Stock Status</b><div class="sm-sb" id="sm-sb"></div><div id="sm-k4" class="sm-row" style="margin-top:8px"></div></div><div class="sm-box"><b>Top 10 Low Stock &amp; Out of Stock</b><div class="scroll" id="sm-top"></div></div></div>';
  fill('sm-fac', u(function (k) { return X.mc[k][1]; })); fill('sm-line', u(function (k) { return X.mc[k][2]; }));
  fill('sm-no', ks.slice().sort()); fill('sm-nm', u(function (k) { return X.mc[k][0]; }));
  $('sm-prev').onclick = function () { ym = C.mAdd(ym, -1); render(); };
  $('sm-next').onclick = function () { ym = C.mAdd(ym, 1); render(); };
  $('sm-w').onclick = function (ev) { var el = ev.target; while (el && el !== this && !el.getAttribute('data-w')) el = el.parentNode; if (el && el !== this) { sel = el.getAttribute('data-w'); render(); } };
}
function render() {
  var root = $('sm-root'); if (!root) return;
  if (!$('sm-fac')) build(root);
  if (!ym) { var om = C.orderMonths(); ym = om.length ? om.sort(function (a, b) { return C.monthOrders(b).total - C.monthOrders(a).total; })[0] : new Date().toISOString().slice(0, 7); }
  var ks = mach(), set = {}, ms = ks.map(mm), cost = 0, T = X.tg, mo = D.rel.months, f = { from: mo[0], to: mo[mo.length - 1] }, rel = C.reliability(f), sr = C.series(f);
  ks.forEach(function (k) { set[k] = 1; }); ms.forEach(function (x) { cost += x.cost; });
  /* 1. Reliability & Cost: IR, MTTR, MTBF from the Call System KPI sheet (all sections); cost and machine tables follow the machine filters */
  $('sm-k1').innerHTML = tile('blue', 'IR', nf(rel.ir, 1) + ' %', 'Target &le; ' + T.ir + ' %') + tile('green', 'MTTR', nf(rel.mttr, 1) + ' h', 'Target &le; ' + T.mttr + ' h') +
    tile('purple', 'MTBF', nf(rel.mtbf, 0) + ' h', 'Target &ge; ' + T.mtbf + ' h') + tile('orange', 'Consumable Cost', X.rp(cost), 'Plan ' + X.rp(cost * T.costPlan));
  [['sm-c1', 'ir', 'IR (%)', T.ir, '#1565c0'], ['sm-c2', 'mttr', 'MTTR (h)', T.mttr, '#2e7d32'], ['sm-c3', 'mtbf', 'MTBF (h)', T.mtbf, '#6a1b9a']].forEach(function (c) {
    draw(c[0], { type: 'line', data: { labels: sr.labels, datasets: [{ label: 'Actual', data: sr[c[1]], borderColor: c[4], backgroundColor: c[4], fill: false, lineTension: 0 },
      { label: 'Plan', data: sr.labels.map(function () { return c[3]; }), borderColor: '#d32f2f', borderDash: [5, 4], pointRadius: 0, fill: false }] }, options: opt(c[2]) });
  });
  var w = ms.slice().sort(function (a, b) { return b.bd - a.bd; }).slice(0, 5), s = w.filter(function (x) { return x.k == sel; })[0] || w[0];
  $('sm-w').innerHTML = w.map(function (x, i) { return '<div class="sm-w' + (s && x.k == s.k ? ' on' : '') + '" data-w="' + x.k + '"><b>' + (i + 1) + '. ' + x.k + '</b> ' + e(x.m[0]) + '<span>' + nf(x.bd, 1) + ' h &middot; ' + x.fr + 'x</span></div>'; }).join('') || '<div class="empty">No machine.</div>';
  $('sm-d').innerHTML = s ? '<b>' + s.k + ' ' + e(s.m[0]) + '</b> (' + e(s.m[2]) + ', ' + e(s.m[3]) + ')<br>Breakdown ' + nf(s.bd, 1) + ' h, ' + s.fr + ' times, MTTR ' + nf(s.mttr, 1) + ' h<ul>' +
    [0, 1, 2].map(function (i) { return '<li>' + X.iss[(+s.k + i) % X.iss.length] + '</li>'; }).join('') + '</ul>' : '';
  var pl = {}, ac = {};
  D.orders.forEach(function (o) { var k = mno(o); pl[k] = (pl[k] || 0) + 1; if (o.status === 'Complete') ac[k] = (ac[k] || 0) + 1; });
  $('sm-tb').innerHTML = '<table class="dt"><tr>' + ['Factory', 'Line', 'Machine No.', 'Machine Name', 'Plan (Year)', 'Actual (Year)', 'Plan Att. %', 'IR %', 'MTTR (h)', 'MTBF (h)', 'Consumable Cost'].map(function (t) { return '<th>' + t + '</th>'; }).join('') + '</tr>' +
    ms.slice().sort(function (a, b) { return b.ir - a.ir; }).slice(0, 100).map(function (x) {
      var p = pl[x.k] || 0, a = ac[x.k] || 0;
      return '<tr><td>' + e(x.m[1]) + '</td><td>' + e(x.m[2]) + '</td><td>' + x.k + '</td><td>' + e(x.m[0]) + '</td><td class="num">' + p + '</td><td class="num">' + a + '</td><td class="num">' + (p ? nf(a / p * 100, 1) + '%' : '-') +
        '</td><td class="num">' + nf(x.ir, 1) + '%</td><td class="num">' + nf(x.mttr, 1) + '</td><td class="num">' + nf(x.mtbf, 0) + '</td><td class="num">' + X.rp(x.cost) + '</td></tr>';
    }).join('') + '</table>' + (ms.length > 100 ? '<p class="note">Top 100 of ' + ms.length + ' machines (highest IR).</p>' : '');
  /* 2. Maintenance: preventive orders of the selected machines, month by month */
  var all = D.orders.filter(function (o) { return set[mno(o)]; }), p = C.monthOrders(ym, all);
  $('sm-ct').textContent = new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5) - 1, 1)).toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  $('sm-k2').innerHTML = tile('blue', 'Planned Maintenance', nf(p.total), 'jobs') + tile('green', 'Completed (Actual)', p.hasStatus ? nf(p.done) : '-', 'jobs') +
    tile('red', 'Overdue / Not Completed', p.hasStatus ? nf(p.overdue) : '-', 'jobs') + tile('teal', 'Plan Attainment', p.attain == null ? '-' : nf(p.attain * 100, 1) + ' %', p.hasStatus ? p.done + ' / ' + p.total : '');
  $('sm-cal').innerHTML = cal(p.orders);
  /* 3. Consumable inventory (all plants) */
  var iv = D.materials.map(C.inv), n = { 'Out of Stock': 0, 'Below Minimum': 0, Normal: 0, 'Above Maximum': 0 }, g = {}, tv = 0;
  iv.forEach(function (r) { n[r.status]++; if (r.value) { tv += r.value; g[r.group] = (g[r.group] || 0) + r.value; } });
  $('sm-k3').innerHTML = tile('blue', 'Total Item', nf(iv.length)) + tile('green', 'Total Value', X.rp(tv)) + tile('orange', 'Low Stock', nf(n['Below Minimum']), 'item') + tile('red', 'Out of Stock', nf(n['Out of Stock']), 'item');
  draw('sm-c4', { type: 'doughnut', data: { labels: X.grp, datasets: [{ data: X.grp.map(function (k) { return Math.round((g[k] || 0) / 1e6); }), backgroundColor: X.gc }] },
    options: { responsive: true, maintainAspectRatio: false, title: { display: true, text: 'Inventory Value by Category (Rp million)' }, legend: { position: 'right' } } });
  draw('sm-c5', { type: 'line', data: { labels: X.tm, datasets: [{ label: 'Rp million', data: (X.tv || X.tf.map(function (v) { return tv * v; })).map(function (v) { return Math.round(v / 1e6); }), borderColor: '#1565c0', backgroundColor: '#1565c0', fill: false, lineTension: 0 }] }, options: opt('Inventory Value Trend (Rp million)') });
  $('sm-sb').innerHTML = [['Normal', n.Normal, '#2e7d32'], ['Above Max', n['Above Maximum'], '#484848'], ['Low', n['Below Minimum'], '#d9822b'], ['Out', n['Out of Stock'], '#c1272d']].map(function (c) {
    return '<div style="flex:' + c[1] + ';background:' + c[2] + '" title="' + c[0] + ': ' + nf(c[1]) + '">' + nf(c[1] / iv.length * 100) + '%</div>'; }).join('');
  $('sm-k4').innerHTML = tile('blue', 'Inventory Turnover (YTD)', T.turn[0] + 'x', 'Target &ge; ' + T.turn[1] + 'x') + tile('green', 'Inventory Accuracy', T.acc + ' %');
  $('sm-top').innerHTML = '<table class="dt"><tr><th>Part Number</th><th>Description</th><th>On Hand</th><th>Min Stock</th><th>Status</th></tr>' +
    iv.filter(function (r) { return r.status == 'Out of Stock' || r.status == 'Below Minimum'; }).sort(function (a, b) { return (a.status == b.status ? 0 : a.status == 'Out of Stock' ? -1 : 1) || (b.min - a.min); }).slice(0, 10).map(function (r) {
      return '<tr><td>' + e(r.material) + '</td><td>' + e(r.description) + '</td><td class="num">' + nf(r.actual) + '</td><td class="num">' + nf(r.min) + '</td><td>' + r.status + '</td></tr>'; }).join('') + '</table>';
}
window.Summary = { render: render, reset: function () { var r = $('sm-root'); if (r) r.innerHTML = ''; } };
})();
