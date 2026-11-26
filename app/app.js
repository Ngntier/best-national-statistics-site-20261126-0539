/* NusaData application: hash router, page views and every control.
   No network is used anywhere: all content comes from data.js in this
   folder, and every chart is drawn by charts.js as inline SVG. */

(function () {
  'use strict';
  var D = window.NUSA;
  var C = window.CHART;
  var main = document.getElementById('page');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-route]'));

  var ROUTES = [
    { id: 'overview', path: '', title: 'Overview', label: 'Overview' },
    { id: 'population', path: 'population', title: 'Population & Demographics', label: 'Population' },
    { id: 'economy', path: 'economy', title: 'Economy', label: 'Economy' },
    { id: 'labour', path: 'labour', title: 'Labour & Prices', label: 'Labour & Prices' },
    { id: 'health', path: 'health', title: 'Health & Education', label: 'Health & Education' },
    { id: 'regions', path: 'regions', title: 'Regions & Provinces', label: 'Regions' },
    { id: 'sources', path: 'sources', title: 'Methodology & Sources', label: 'Sources' },
  ];

  function routeFromHash() {
    var hash = location.hash.replace(/^#\/?/, '');
    var found = null;
    ROUTES.forEach(function (r) { if (r.path === hash) found = r; });
    return found || ROUTES[0];
  }

  function fmtNum(value, decimals) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    });
  }

  /* KPI numbers: two decimals at most, trailing zero trimmed (285.7, 5.1,
     but 75.02 keeps both digits). */
  function fmtKpi(value) {
    var s = fmtNum(value, 2);
    if (s.indexOf('.') !== -1) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }

  function sourceLine(source, year) {
    return '<p class="source">Source: ' + C.esc(source) + ' · ' + year + '</p>';
  }

  function kpiCard(item) {
    return '<article class="kpi"><p class="kpi-label">' + C.esc(item.label) + '</p>'
      + '<p class="kpi-value">' + fmtKpi(item.value)
      + ' <span>' + C.esc(item.unit) + '</span></p>'
      + '<p class="kpi-meta">' + C.esc(item.year) + ' · ' + C.esc(item.note) + '</p>'
      + '<p class="kpi-src">' + C.esc(item.source) + '</p></article>';
  }

  function sectionHead(kicker, title, intro) {
    return '<header class="pagehead"><p class="kicker">' + C.esc(kicker) + '</p><h1>'
      + C.esc(title) + '</h1><p class="lede">' + intro + '</p></header>';
  }

  function card(title, body, extra) {
    return '<section class="card' + (extra ? ' ' + extra : '') + '"><h2>'
      + C.esc(title) + '</h2>' + body + '</section>';
  }

  /* ---------- Overview ---------- */

  function viewOverview() {
    var kpis = D.headline.map(kpiCard).join('');
    var popPoints = D.series.population.map(function (p) { return { year: p.year, value: p.value }; });
    var growthBars = D.series.gdpGrowth.map(function (p) { return { label: String(p.year).slice(2), value: p.value }; });
    var topProvinces = D.provinces.slice(0, 5).map(function (p) {
      return { label: p.name, value: p.pop, unit: 'm', note: p.capital + ' · ' + fmtNum(p.pop / D.headline[0].value * 100, 1) + '% of Indonesia' };
    });
    var releases = D.releases.map(function (r) {
      return '<li><span class="rel-date">' + C.esc(r.date) + '</span><strong>' + C.esc(r.title)
        + '</strong><span>' + C.esc(r.detail) + '</span></li>';
    }).join('');

    return sectionHead('Indonesia · Republik Indonesia', 'Indonesia in numbers',
      'The essential statistics of the world\u2019s fourth most populous country and Southeast Asia\u2019s largest economy — population, economy, work, health and the provinces, each figure with its source and year.')
      + '<div class="kpis">' + kpis + '</div>'
      + '<div class="grid2">'
      + card('Population, 2015–2025',
          '<p class="card-note">Total population, millions. The step in 2020 follows the census rebasing.</p>'
          + C.lineChart(popPoints, { height: 250, area: true, unit: 'm' })
          + sourceLine('World Bank WDI', '2025'))
      + card('Real GDP growth, 2019–2025',
          '<p class="card-note">Annual change in GDP, adjusted for inflation. The 2020 contraction is the pandemic year.</p>'
          + C.barChart(growthBars, { height: 250, decimals: 2 })
          + sourceLine('World Bank WDI / IMF WEO', '2025'))
      + '</div>'
      + '<div class="grid2">'
      + card('Largest provinces by population',
          C.rankBars(topProvinces, { decimals: 1 })
          + '<p class="more-link"><a href="#/regions">Compare all ten largest provinces →</a></p>'
          + sourceLine('BPS mid-year estimates', '2024'))
      + card('Latest releases',
          '<ul class="releases">' + releases + '</ul>')
      + '</div>'
      + '<div class="facts"><div><strong>' + fmtNum(D.meta.landAreaKm2) + ' km²</strong><span>Land area (World Bank, '
      + D.meta.landAreaYear + ')</span></div><div><strong>' + D.meta.populationDensity + ' people/km²</strong><span>Population density ('
      + D.meta.densityYear + ')</span></div><div><strong>' + D.wellbeing.urbanShare + '%</strong><span>Live in cities (World Bank, '
      + D.wellbeing.urbanYear + ')</span></div><div><strong>' + D.wellbeing.medianAge + ' years</strong><span>Median age (UN, '
      + D.wellbeing.medianAgeYear + ')</span></div></div>';
  }

  /* ---------- Population ---------- */

  function provinceRows() {
    return D.provinces.map(function (p) {
      var density = Math.round((p.pop * 1000000) / p.area);
      var share = (p.pop / D.headline[0].value * 100).toFixed(1);
      return { name: p.name, pop: p.pop, area: p.area, density: density, share: Number(share), capital: p.capital };
    });
  }

  function sortableTable(heads, rows, renderRow) {
    var thead = '<tr>' + heads.map(function (h, i) {
      return '<th><button type="button" data-sort="' + i + '" data-dir="1">' + C.esc(h.label)
        + ' <span aria-hidden="true">↕</span></button></th>';
    }).join('') + '</tr>';
    var tbody = rows.map(renderRow).join('');
    return '<div class="tablewrap"><table class="data" data-sortable="1"><thead>' + thead
      + '</thead><tbody>' + tbody + '</tbody></table></div>';
  }

  function viewPopulation() {
    var rows = provinceRows();
    var table = sortableTable(
      [{ label: 'Province' }, { label: 'Population (m)' }, { label: 'Area (km²)' }, { label: 'Density /km²' }, { label: 'Share of Indonesia' }, { label: 'Capital' }],
      rows,
      function (r) {
        return '<tr><td>' + C.esc(r.name) + '</td><td class="num">' + fmtNum(r.pop, 1) + '</td><td class="num">'
          + fmtNum(r.area) + '</td><td class="num">' + fmtNum(r.density) + '</td><td class="num">' + fmtNum(r.share, 1)
          + '%</td><td>' + C.esc(r.capital) + '</td></tr>';
      });
    return sectionHead('Population & Demographics', 'A young, urbanising archipelago',
      '285.7 million people live across more than 17,000 islands. The population is still young — a median age of 31.8 years — and just under three in five Indonesians now live in cities.')
      + '<div class="grid2">'
      + card('Population pyramid, 2024',
          '<p class="card-note">Share of the total population in each five-year age band. The wide base is a young population; the narrowing top is longer life.</p>'
          + C.pyramid(D.ageGroups)
          + sourceLine('UN World Population Prospects, via BPS age structure', '2024'))
      + card('Age structure, 2024',
          '<p class="card-note">Nearly seven in ten Indonesians are of working age — a demographic dividend that lasts into the 2030s.</p>'
          + C.rankBars(D.ageSummary.map(function (a) { return { label: a.band, value: a.share, unit: '%', note: '' }; }), { decimals: 1 })
          + '<ul class="keylist"><li><strong>24.3%</strong> children under 15</li><li><strong>68.8%</strong> of working age, 15–64</li><li><strong>6.9%</strong> aged 65 and over</li><li><strong>2.12</strong> children per woman (fertility, 2024)</li></ul>'
          + sourceLine('World Bank WDI', '2024'))
      + '</div>'
      + card('Ten largest provinces',
          '<p class="card-note">Click a column heading to sort. Java holds more than half of all Indonesians on less than 7% of the land.</p>'
          + table
          + sourceLine('BPS mid-year population estimates; area BPS', '2024'))
      + '<p class="page-note">Population figures for 2020 onwards follow the 2020 census rebasing; earlier years are the World Bank series as published before it. Density is computed from the population and area shown.</p>';
  }

  /* ---------- Economy ---------- */

  function economyYearData(year) {
    function at(series) {
      var hit = null;
      series.forEach(function (p) { if (p.year === year) hit = p.value; });
      return hit;
    }
    return {
      year: year,
      gdp: at(D.series.gdpNominal),
      growth: at(D.series.gdpGrowth),
      perCapita: at(D.series.gdpPerCapita),
      inflation: at(D.series.inflation),
    };
  }

  function viewEconomy() {
    var years = D.series.gdpNominal.map(function (p) { return p.year; });
    var options = years.map(function (y) {
      return '<option value="' + y + '"' + (y === 2025 ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
    var gdpPoints = D.series.gdpNominal.map(function (p) { return { year: p.year, value: p.value }; });
    var sectorColors = ['#0f6a63', '#d96f3c', '#e8b64c', '#8fa8a5'];
    var slices = D.sectors.map(function (s, i) {
      return { name: s.name, share: s.share, color: sectorColors[i % sectorColors.length] };
    });
    var sectorRows = D.sectors.map(function (s) {
      return '<li><strong>' + C.esc(s.name) + ' — ' + fmtNum(s.share, 1) + '%</strong><span>' + C.esc(s.detail) + '</span></li>';
    }).join('');
    var exportRows = D.trade.topExports.map(function (e) {
      return '<tr><td>' + C.esc(e.good) + '</td><td class="num">' + fmtNum(e.share, 1) + '%</td></tr>';
    }).join('');

    return sectionHead('Economy', 'Southeast Asia\u2019s largest economy',
      'A US$1.45 trillion economy that has grown around 5% a year for a decade, powered by household spending, commodity exports and a large domestic market of 286 million people.')
      + '<div class="toolbar"><label for="yearPick">Year <select id="yearPick">' + options + '</select></label>'
      + '<span class="toolbar-note">Pick a year to update the four headline figures below.</span></div>'
      + '<div class="kpis" id="yearKpis"></div>'
      + '<div class="grid2">'
      + card('GDP in current US dollars, 2019–2025',
          '<div class="toggle" role="group" aria-label="GDP measure"><button type="button" data-metric="gdpNominal" class="on">Nominal US$</button><button type="button" data-metric="gdpPerCapita">Per person</button></div>'
          + '<div id="gdpChart">' + C.lineChart(gdpPoints, { height: 250, area: true, unit: 'US$ bn' }) + '</div>'
          + sourceLine('World Bank WDI', '2025'))
      + card('What the economy makes, 2024',
          '<div class="donut-wrap">' + C.donut(slices, { centre: '100%', centreSub: 'of value added' }) + '</div>'
          + '<ul class="keylist">' + sectorRows + '</ul>'
          + sourceLine('World Bank WDI — value added by sector', '2024'))
      + '</div>'
      + card('Trade, 2024',
          '<p class="card-note">Indonesia exported US$264.7 billion and imported US$233.7 billion — a surplus of US$31.0 billion. Exports were 22.2% of GDP; imports 20.4%.</p>'
          + '<div class="grid2"><div><h3>Biggest export goods</h3><div class="tablewrap"><table class="data"><thead><tr><th>Good</th><th>Share of exports</th></tr></thead><tbody>'
          + exportRows + '</tbody></table></div></div>'
          + '<div><h3>Trade in context</h3><ul class="keylist"><li><strong>US$264.7 bn</strong> exports (BPS, 2024)</li><li><strong>US$233.7 bn</strong> imports (BPS, 2024)</li><li><strong>22.2%</strong> exports as a share of GDP</li><li><strong>40.8%</strong> government debt as a share of GDP (IMF, 2025)</li></ul></div></div>'
          + sourceLine('BPS / World Bank WDI', '2024'));
  }

  function renderYearKpis(year) {
    var d = economyYearData(year);
    var host = document.getElementById('yearKpis');
    if (!host) return;
    var items = [
      { label: 'GDP (nominal)', value: d.gdp, unit: 'US$ bn', note: 'current US dollars' },
      { label: 'Real GDP growth', value: d.growth, unit: '%', note: 'year on year' },
      { label: 'GDP per person', value: d.perCapita, unit: 'US$', note: 'current US dollars' },
      { label: 'Inflation (CPI)', value: d.inflation, unit: '%', note: 'annual average' },
    ];
    host.innerHTML = items.map(function (it) {
      return '<article class="kpi"><p class="kpi-label">' + C.esc(it.label) + '</p><p class="kpi-value">'
        + fmtKpi(it.value) + ' <span>' + C.esc(it.unit) + '</span></p><p class="kpi-meta">'
        + d.year + ' · ' + C.esc(it.note) + '</p></article>';
    }).join('');
  }

  /* ---------- Labour & Prices ---------- */

  function viewLabour() {
    var uPoints = D.series.unemployment.map(function (p) { return { year: p.year, value: p.value }; });
    var iPoints = D.series.inflation.map(function (p) { return { year: p.year, value: p.value }; });
    var cpiRows = D.series.inflation.map(function (p) {
      var u = null;
      D.series.unemployment.forEach(function (q) { if (q.year === p.year) u = q.value; });
      return '<tr><td>' + p.year + '</td><td class="num">' + fmtNum(p.value, 1) + '%</td><td class="num">'
        + (u === null ? '—' : fmtNum(u, 1) + '%') + '</td></tr>';
    }).join('');
    return sectionHead('Labour & Prices', 'Work and the cost of living',
      'Unemployment is low by global standards at 3.2%, but the headline hides a harder youth market: 13.0% of 15–24 year olds looking for work cannot find it. Inflation has stayed inside Bank Indonesia\u2019s 2–4% target band since 2023.')
      + '<div class="kpis">'
      + kpiCard({ label: 'Unemployment', value: 3.2, unit: '%', year: 2025, source: 'World Bank, ILO modelled', note: 'of the labour force' })
      + kpiCard({ label: 'Youth unemployment (15–24)', value: 13.0, unit: '%', year: 2025, source: 'World Bank, ILO modelled', note: 'four times the adult rate' })
      + kpiCard({ label: 'Labour force', value: 145.2, unit: 'million', year: 2024, source: 'World Bank WDI', note: '67.9% participate' })
      + kpiCard({ label: 'Poverty rate', value: 8.2, unit: '%', year: 2025, source: 'BPS national line', note: 'down from 8.6% in 2024' })
      + '</div>'
      + '<div class="grid2">'
      + card('Unemployment, 2022–2025',
          '<p class="card-note">Share of the labour force without work but available and seeking it (ILO modelled estimate).</p>'
          + C.lineChart(uPoints, { height: 250, decimals: 1, unit: '%' })
          + sourceLine('World Bank WDI, ILO modelled', '2025'))
      + card('Consumer price inflation, 2019–2025',
          '<p class="card-note">Annual change in consumer prices. The 2022 spike followed the global energy shock; prices have cooled since.</p>'
          + C.barChart(iPoints.map(function (p) { return { label: String(p.year).slice(2), value: p.value }; }), { height: 250, decimals: 1 })
          + sourceLine('World Bank WDI', '2025'))
      + '</div>'
      + card('Prices and jobs by year',
          '<p class="card-note">Unemployment is published on the ILO modelled series from 2022; the national BPS open-unemployment measure runs higher (4.8% in 2024) because it counts differently.</p>'
          + '<div class="tablewrap"><table class="data"><thead><tr><th>Year</th><th>Inflation (CPI)</th><th>Unemployment</th></tr></thead><tbody>'
          + cpiRows + '</tbody></table></div>'
          + sourceLine('World Bank WDI', '2025'))
      + '<div class="grid2">'
      + card('Inequality', '<ul class="keylist"><li><strong>34.4</strong> Gini index (World Bank, 2025) — 0 is perfect equality, 100 is total inequality</li><li><strong>8.2%</strong> of people live below the national poverty line (BPS, 2025)</li><li><strong>65.2%</strong> live on less than US$6.85 a day (World Bank, 2025)</li></ul>')
      + card('What workers earn', '<ul class="keylist"><li><strong>145.2 million</strong> people in the labour force (2024)</li><li><strong>67.9%</strong> of people aged 15+ participate (2024)</li><li><strong>13.2%</strong> youth unemployment among young men (2024)</li><li><strong>IDR 5.07 million</strong> average monthly wage, about US$320 (2024)</li></ul>'
          + sourceLine('World Bank WDI / BPS', '2024'))
      + '</div>';
  }

  /* ---------- Health & Education ---------- */

  function viewHealth() {
    var lifePoints = D.series.lifeExpectancy.map(function (p) { return { year: p.year, value: p.value }; });
    var imPoints = D.series.infantMortality.map(function (p) { return { year: p.year, value: p.value }; });
    var w = D.wellbeing;
    return sectionHead('Health & Education', 'Living longer, learning more',
      'Indonesians live to 71.3 years on average, up from the pandemic dip of 2021. Schooling is near-universal at primary level, and almost half of young adults now reach tertiary education.')
      + '<div class="kpis">'
      + kpiCard({ label: 'Life expectancy', value: 71.3, unit: 'years', year: 2024, source: 'World Bank WDI', note: '73.4 women · 69.2 men' })
      + kpiCard({ label: 'Infant mortality', value: 15.2, unit: 'per 1,000', year: 2024, source: 'World Bank WDI', note: 'live births' })
      + kpiCard({ label: 'Adult literacy', value: 96, unit: '%', year: 2020, source: 'UNESCO', note: 'of people aged 15+' })
      + kpiCard({ label: 'Human Development Index', value: 75.02, unit: 'points', year: 2024, source: 'BPS', note: 'high human development' })
      + '</div>'
      + '<div class="grid2">'
      + card('Life expectancy at birth, 2019–2024',
          '<p class="card-note">Years a newborn can expect to live. The 2020–2021 dip is the COVID-19 pandemic; the recovery since is complete.</p>'
          + C.lineChart(lifePoints, { height: 250, decimals: 1, unit: 'yrs', area: true })
          + sourceLine('World Bank WDI', '2024'))
      + card('Infant mortality, 2019–2024',
          '<p class="card-note">Deaths before age one per 1,000 live births — down every year of the series.</p>'
          + C.lineChart(imPoints, { height: 250, decimals: 1, area: true, color: '#d96f3c' })
          + sourceLine('World Bank WDI', '2024'))
      + '</div>'
      + '<div class="grid2">'
      + card('Education',
          '<ul class="keylist"><li><strong>100.4%</strong> gross primary enrolment (2025)</li><li><strong>97.2%</strong> gross secondary enrolment (2025)</li><li><strong>44.9%</strong> gross tertiary enrolment (2023)</li><li><strong>8.7 years</strong> mean years of schooling (UNDP, 2023)</li><li><strong>96%</strong> of adults can read and write (UNESCO, 2020)</li></ul>'
          + sourceLine('World Bank WDI / UNDP / UNESCO', '2025'))
      + card('Health',
          '<ul class="keylist"><li><strong>2.7%</strong> of GDP spent on health (World Bank, 2023)</li><li><strong>2.12</strong> children per woman (World Bank, 2024)</li><li><strong>72.8%</strong> of people use the internet (World Bank, 2024)</li><li><strong>140</strong> maternal deaths per 100,000 live births (World Bank, 2023)</li></ul>'
          + sourceLine('World Bank WDI', '2024'))
      + '</div>';
  }

  /* ---------- Regions ---------- */

  function viewRegions() {
    var rows = provinceRows();
    var options = D.provinces.map(function (p, i) {
      return '<option value="' + i + '"' + (i === 0 ? ' selected' : '') + '>' + C.esc(p.name) + '</option>';
    }).join('');
    var table = sortableTable(
      [{ label: 'Province' }, { label: 'Population (m)' }, { label: 'Area (km²)' }, { label: 'Density /km²' }, { label: 'Share of Indonesia' }, { label: 'Capital' }],
      rows,
      function (r) {
        return '<tr data-name="' + C.esc(r.name.toLowerCase()) + '"><td>' + C.esc(r.name) + '</td><td class="num">' + fmtNum(r.pop, 1)
          + '</td><td class="num">' + fmtNum(r.area) + '</td><td class="num">' + fmtNum(r.density)
          + '</td><td class="num">' + fmtNum(r.share, 1) + '%</td><td>' + C.esc(r.capital) + '</td></tr>';
      });
    return sectionHead('Regions & Provinces', 'Thirty-eight provinces, one archipelago',
      'Indonesia is divided into 38 provinces across more than 17,000 islands. Java — six provinces on one island — holds over half the population, while the largest provinces by land, in Papua and Kalimantan, are among the least dense.')
      + '<div class="toolbar"><label for="provPick">Province <select id="provPick">' + options + '</select></label>'
      + '<label for="provSearch">Filter table <input id="provSearch" type="search" placeholder="Type a province name…" autocomplete="off"></label></div>'
      + '<div id="provDetail"></div>'
      + card('Population by province, 2024',
          C.rankBars(D.provinces.map(function (p) {
            return { label: p.name, value: p.pop, unit: 'm', note: p.capital };
          }), { decimals: 1 })
          + sourceLine('BPS mid-year estimates', '2024'))
      + card('All ten largest provinces',
          '<p class="card-note">Click a column heading to sort; use the filter above to narrow the table.</p>' + table
          + sourceLine('BPS mid-year estimates; density computed from population and area', '2024'));
  }

  function renderProvinceDetail(index) {
    var host = document.getElementById('provDetail');
    if (!host) return;
    var p = D.provinces[index];
    var rows = provinceRows();
    var r = rows[index];
    var nationalDensity = D.meta.populationDensity;
    var denser = r.density > nationalDensity;
    host.innerHTML = '<section class="card highlight"><h2>' + C.esc(p.name) + '</h2>'
      + '<div class="facts"><div><strong>' + fmtNum(p.pop, 1) + ' million</strong><span>Population (BPS, 2024)</span></div>'
      + '<div><strong>' + fmtNum(p.area) + ' km²</strong><span>Land area</span></div>'
      + '<div><strong>' + fmtNum(r.density) + ' /km²</strong><span>Density — '
      + (denser ? 'denser' : 'sparser') + ' than the national ' + nationalDensity + '/km²</span></div>'
      + '<div><strong>' + fmtNum(r.share, 1) + '%</strong><span>Share of Indonesia\u2019s population</span></div></div>'
      + '<p class="card-note">Capital: ' + C.esc(p.capital) + '. One person in ' + Math.max(1, Math.round(100 / r.share))
      + ' Indonesians lives in ' + C.esc(p.name) + '.</p></section>';
  }

  /* ---------- Sources ---------- */

  function viewSources() {
    var rows = D.sources.map(function (s) {
      return '<tr><td><strong>' + C.esc(s.publisher) + '</strong><br><span class="muted">' + C.esc(s.what)
        + '</span></td><td class="num">' + C.esc(s.years) + '</td><td>' + C.esc(s.note) + '</td></tr>';
    }).join('');
    return sectionHead('Methodology & Sources', 'How every figure was chosen',
      'NusaData publishes only figures it can point at. Each number on this site names its publisher and the year it refers to; nothing is modelled, estimated by us, or invented.')
      + card('Our rules',
          '<ol class="rules"><li><strong>Published figures only.</strong> Every number comes from a national statistical office, the World Bank, the IMF, the UN or UNESCO — never from another statistics site.</li>'
          + '<li><strong>Year on every figure.</strong> A figure without a year is a figure you cannot trust; each card states the year its numbers refer to.</li>'
          + '<li><strong>Latest available, not latest wished for.</strong> Where the newest published year is 2023 or 2024, the site says so instead of stretching a newer estimate.</li>'
          + '<li><strong>Revisions are noted.</strong> The population series steps in 2020 because the 2020 census rebased the count; the note travels with the chart.</li>'
          + '<li><strong>Derived numbers are labelled.</strong> Densities and shares are computed from the published figures shown beside them.</li></ol>')
      + card('Sources',
          '<div class="tablewrap"><table class="data"><thead><tr><th>Publisher &amp; coverage</th><th>Years</th><th>Note</th></tr></thead><tbody>'
          + rows + '</tbody></table></div>')
      + card('About this site',
          '<p>NusaData is an independent, original statistics site built for readers who want Indonesia\u2019s key numbers in one place, with sources attached. It is not affiliated with Statistics Indonesia (BPS), the World Bank, the IMF or the United Nations. Figures were last checked on '
          + C.esc(D.meta.updated) + '. Publishers revise their series; where a figure has since been revised, the publisher\u2019s current release governs.</p>'
          + '<p class="more-link"><a href="#/">Back to the overview →</a></p>');
  }

  /* ---------- Router & wiring ---------- */

  var VIEWS = {
    overview: viewOverview,
    population: viewPopulation,
    economy: viewEconomy,
    labour: viewLabour,
    health: viewHealth,
    regions: viewRegions,
    sources: viewSources,
  };

  function render() {
    var route = routeFromHash();
    main.innerHTML = VIEWS[route.id]();
    navLinks.forEach(function (a) {
      var on = a.getAttribute('data-route') === route.id;
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    wirePage(route.id);
  }

  function wirePage(routeId) {
    if (routeId === 'economy') {
      renderYearKpis(2025);
      var pick = document.getElementById('yearPick');
      if (pick) pick.addEventListener('change', function () { renderYearKpis(Number(pick.value)); });
      var chartHost = document.getElementById('gdpChart');
      var toggles = document.querySelectorAll('[data-metric]');
      toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
          toggles.forEach(function (b) { b.classList.remove('on'); });
          btn.classList.add('on');
          var metric = btn.getAttribute('data-metric');
          var points = D.series[metric].map(function (p) { return { year: p.year, value: p.value }; });
          var unit = metric === 'gdpNominal' ? 'US$ bn' : 'US$';
          if (chartHost) chartHost.innerHTML = C.lineChart(points, { height: 250, area: true, unit: unit });
        });
      });
    }
    if (routeId === 'regions') {
      renderProvinceDetail(0);
      var sel = document.getElementById('provPick');
      if (sel) sel.addEventListener('change', function () { renderProvinceDetail(Number(sel.value)); });
      var search = document.getElementById('provSearch');
      if (search) search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        document.querySelectorAll('tr[data-name]').forEach(function (tr) {
          tr.style.display = !q || tr.getAttribute('data-name').indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }
    document.querySelectorAll('table[data-sortable]').forEach(function (table) {
      table.querySelectorAll('th button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var col = Number(btn.getAttribute('data-sort'));
          var dir = Number(btn.getAttribute('data-dir'));
          var tbody = table.querySelector('tbody');
          var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
          rows.sort(function (a, b) {
            var av = a.children[col].textContent.trim();
            var bv = b.children[col].textContent.trim();
            var an = parseFloat(av.replace(/[^0-9.\-]/g, ''));
            var bn = parseFloat(bv.replace(/[^0-9.\-]/g, ''));
            if (!isNaN(an) && !isNaN(bn)) return (an - bn) * dir;
            return av.localeCompare(bv) * dir;
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
          btn.setAttribute('data-dir', String(-dir));
          table.querySelectorAll('th button').forEach(function (other) {
            other.classList.toggle('sorted', other === btn);
          });
        });
      });
    });
  }

  document.getElementById('year').textContent = String(new Date().getFullYear());
  window.addEventListener('hashchange', render);
  render();
})();
