/* NusaData — Indonesia in Numbers.
   Every figure below is a published statistic with its source and year.
   Main sources: World Bank World Development Indicators (WDI), Statistics
   Indonesia (BPS), IMF World Economic Outlook, UNDP, UNESCO. Values are
   the latest published at the time this site was built (November 2026).
   No figure here is invented: where a series was revised by its publisher
   (the 2020 census rebasing of the population count) the note says so. */

var NUSA = {
  meta: {
    country: 'Indonesia',
    countryId: 'Republik Indonesia',
    capital: 'Jakarta',
    capitalNote: 'Nusantara is the new capital under construction',
    currency: 'Indonesian rupiah (IDR)',
    language: 'Indonesian',
    landAreaKm2: 1892555,
    landAreaYear: 2023,
    landAreaSource: 'World Bank WDI',
    populationDensity: 149,
    densityYear: 2024,
    updated: '26 November 2026',
  },

  /* Headline indicators shown on the dashboard. */
  headline: [
    { key: 'population', label: 'Population', value: 285.7, unit: 'million', year: 2025, source: 'World Bank WDI', note: '4th largest in the world' },
    { key: 'gdp', label: 'GDP (nominal)', value: 1446, unit: 'US$ bn', year: 2025, source: 'World Bank WDI', note: '17th largest economy' },
    { key: 'gdpPc', label: 'GDP per person', value: 5060, unit: 'US$', year: 2025, source: 'World Bank WDI', note: 'US$17,660 in PPP terms (2025)' },
    { key: 'growth', label: 'Real GDP growth', value: 5.1, unit: '%', year: 2025, source: 'IMF WEO', note: '5.03% in 2024' },
    { key: 'unemployment', label: 'Unemployment', value: 3.2, unit: '%', year: 2025, source: 'World Bank, ILO modelled', note: 'of the labour force' },
    { key: 'inflation', label: 'Inflation (CPI)', value: 1.9, unit: '%', year: 2025, source: 'World Bank WDI', note: '2.18% in 2024' },
    { key: 'life', label: 'Life expectancy', value: 71.3, unit: 'years', year: 2024, source: 'World Bank WDI', note: '73.4 yrs women, 69.2 men' },
    { key: 'hdi', label: 'Human Development Index', value: 75.02, unit: 'points', year: 2024, source: 'BPS', note: 'High human development' },
  ],

  /* Annual series, 2015-2025 unless noted. Population is in millions. */
  series: {
    population: [
      { year: 2015, value: 258.4 }, { year: 2016, value: 260.6 },
      { year: 2017, value: 262.9 }, { year: 2018, value: 265.0 },
      { year: 2019, value: 267.1 }, { year: 2020, value: 274.0 },
      { year: 2021, value: 276.4 }, { year: 2022, value: 278.7 },
      { year: 2023, value: 281.2 }, { year: 2024, value: 283.5 },
      { year: 2025, value: 285.7 },
    ],
    gdpNominal: [
      { year: 2019, value: 1120 }, { year: 2020, value: 1059 },
      { year: 2021, value: 1186 }, { year: 2022, value: 1319 },
      { year: 2023, value: 1371 }, { year: 2024, value: 1403 },
      { year: 2025, value: 1446 },
    ],
    gdpGrowth: [
      { year: 2019, value: 5.02 }, { year: 2020, value: -2.07 },
      { year: 2021, value: 3.69 }, { year: 2022, value: 5.31 },
      { year: 2023, value: 5.05 }, { year: 2024, value: 5.03 },
      { year: 2025, value: 5.1 },
    ],
    gdpPerCapita: [
      { year: 2019, value: 4174 }, { year: 2020, value: 3870 },
      { year: 2021, value: 4292 }, { year: 2022, value: 4784 },
      { year: 2023, value: 4874 }, { year: 2024, value: 4925 },
      { year: 2025, value: 5060 },
    ],
    inflation: [
      { year: 2019, value: 2.8 }, { year: 2020, value: 2.0 },
      { year: 2021, value: 1.6 }, { year: 2022, value: 4.2 },
      { year: 2023, value: 3.7 }, { year: 2024, value: 2.2 },
      { year: 2025, value: 1.9 },
    ],
    unemployment: [
      { year: 2022, value: 3.5 }, { year: 2023, value: 3.4 },
      { year: 2024, value: 3.3 }, { year: 2025, value: 3.2 },
    ],
    lifeExpectancy: [
      { year: 2019, value: 71.2 }, { year: 2020, value: 70.9 },
      { year: 2021, value: 70.5 }, { year: 2022, value: 70.9 },
      { year: 2023, value: 71.2 }, { year: 2024, value: 71.3 },
    ],
    infantMortality: [
      { year: 2019, value: 18.2 }, { year: 2020, value: 17.4 },
      { year: 2021, value: 16.6 }, { year: 2022, value: 16.0 },
      { year: 2023, value: 15.6 }, { year: 2024, value: 15.2 },
    ],
  },

  /* GDP by sector, share of value added, 2024 (World Bank WDI).
     Shares exclude taxes less subsidies on products. */
  sectors: [
    { name: 'Services', share: 43.5, detail: 'Trade, transport, finance, government and other services' },
    { name: 'Industry', share: 39.7, detail: 'Manufacturing, mining, construction and utilities' },
    { name: 'Agriculture, forestry & fishing', share: 11.5, detail: 'Crops, livestock, forestry and fisheries' },
    { name: 'Taxes less subsidies', share: 5.3, detail: 'Net taxes on products, not allocated to a sector' },
  ],

  /* Trade, 2024 (BPS). */
  trade: {
    year: 2024,
    exportsUsdBn: 264.7,
    importsUsdBn: 233.7,
    exportsShareGdp: 22.2,
    importsShareGdp: 20.4,
    surplusUsdBn: 31.0,
    source: 'BPS / World Bank WDI',
    topExports: [
      { good: 'Coal and mineral fuels', share: 24.1 },
      { good: 'Palm oil and vegetable oils', share: 10.8 },
      { good: 'Iron and steel', share: 10.2 },
      { good: 'Electrical machinery', share: 6.4 },
      { good: 'Vehicles and parts', share: 4.9 },
    ],
  },

  /* Age structure, 2024 (shares of total population, %). */
  ageGroups: [
    { band: '0–4', male: 4.0, female: 3.8 },
    { band: '5–9', male: 4.2, female: 3.9 },
    { band: '10–14', male: 4.3, female: 4.1 },
    { band: '15–19', male: 4.3, female: 4.0 },
    { band: '20–24', male: 4.3, female: 4.0 },
    { band: '25–29', male: 4.2, female: 4.0 },
    { band: '30–34', male: 4.0, female: 3.9 },
    { band: '35–39', male: 3.8, female: 3.6 },
    { band: '40–44', male: 3.5, female: 3.4 },
    { band: '45–49', male: 3.2, female: 3.0 },
    { band: '50–54', male: 2.8, female: 2.6 },
    { band: '55–59', male: 2.4, female: 2.2 },
    { band: '60–64', male: 1.9, female: 1.8 },
    { band: '65–69', male: 1.4, female: 1.5 },
    { band: '70–74', male: 0.9, female: 1.1 },
    { band: '75+', male: 0.8, female: 1.2 },
  ],
  ageSummary: [
    { band: 'Children 0–14', share: 24.3 },
    { band: 'Working age 15–64', share: 68.8 },
    { band: 'Older people 65+', share: 6.9 },
  ],

  /* Labour market, latest published. */
  labour: {
    labourForceMillion: 145.2,
    labourForceYear: 2024,
    participation: 67.9,
    participationYear: 2024,
    youthUnemployment: 13.0,
    youthYear: 2025,
    youthMale: 13.2,
    youthMaleYear: 2024,
    poverty: 8.2,
    povertyYear: 2025,
    povertySource: 'BPS national poverty line',
    gini: 34.4,
    giniYear: 2025,
    source: 'World Bank WDI / BPS',
  },

  /* Health and education, latest published. */
  wellbeing: {
    lifeFemale: 73.4,
    lifeMale: 69.2,
    lifeYear: 2024,
    infantMortality: 15.2,
    infantYear: 2024,
    fertility: 2.12,
    fertilityYear: 2024,
    literacy: 96,
    literacyYear: 2020,
    literacySource: 'UNESCO',
    schoolingYears: 8.7,
    schoolingYear: 2023,
    schoolingSource: 'UNDP',
    enrolPrimary: 100.4,
    enrolSecondary: 97.2,
    enrolTertiary: 44.9,
    enrolPrimaryYear: 2025,
    enrolSecondaryYear: 2025,
    enrolTertiaryYear: 2023,
    healthSpendGdp: 2.7,
    healthSpendYear: 2023,
    internetUsers: 72.8,
    internetYear: 2024,
    urbanShare: 59.4,
    urbanYear: 2025,
    medianAge: 31.8,
    medianAgeYear: 2025,
  },

  /* Ten most populous provinces. Population: BPS mid-year estimate 2024,
     millions. Area in km2 (BPS). Density is computed from the two. */
  provinces: [
    { name: 'West Java', pop: 49.9, area: 35378, capital: 'Bandung' },
    { name: 'East Java', pop: 41.8, area: 47800, capital: 'Surabaya' },
    { name: 'Central Java', pop: 37.9, area: 32801, capital: 'Semarang' },
    { name: 'North Sumatra', pop: 15.6, area: 72981, capital: 'Medan' },
    { name: 'Banten', pop: 12.4, area: 9663, capital: 'Serang' },
    { name: 'Jakarta', pop: 10.6, area: 664, capital: 'Jakarta' },
    { name: 'South Sulawesi', pop: 9.5, area: 46717, capital: 'Makassar' },
    { name: 'Lampung', pop: 9.3, area: 34624, capital: 'Bandar Lampung' },
    { name: 'South Sumatra', pop: 8.8, area: 91592, capital: 'Palembang' },
    { name: 'Riau', pop: 6.9, area: 87024, capital: 'Pekanbaru' },
  ],

  /* Latest statistical releases, as a statistics office would list them. */
  releases: [
    { date: 'Nov 2026', title: 'Population estimate 2025: 285.7 million', detail: 'World Bank WDI update — growth of 0.8% on 2024.' },
    { date: 'Nov 2026', title: 'GDP 2025: US$1,446 billion, up 5.1% in real terms', detail: 'IMF World Economic Outlook, October 2026 round.' },
    { date: 'Sep 2026', title: 'Poverty falls to 8.2% (March 2025)', detail: 'BPS national poverty line, September 2026 release.' },
    { date: 'Aug 2026', title: 'Unemployment at 3.2% of the labour force', detail: 'World Bank ILO modelled estimate, 2025.' },
    { date: 'Jul 2026', title: 'Human Development Index 75.02 (2024)', detail: 'BPS: life expectancy, schooling and spending all improved.' },
  ],

  /* Full source list for the methodology page. */
  sources: [
    { publisher: 'World Bank — World Development Indicators', what: 'Population, GDP, GDP per capita, inflation, unemployment, life expectancy, infant mortality, trade shares, internet users, urban share, Gini', years: '2019–2025', note: 'CC BY 4.0; figures as published November 2026.' },
    { publisher: 'Statistics Indonesia (BPS)', what: 'Human Development Index, poverty rate, province populations, exports and imports in US dollars', years: '2024–2025', note: 'National statistical office of Indonesia.' },
    { publisher: 'IMF — World Economic Outlook', what: 'Real GDP growth 2025, GDP per capita in PPP terms', years: '2024–2025', note: 'October 2026 database round.' },
    { publisher: 'UNDP — Human Development Report', what: 'Mean years of schooling', years: '2023', note: 'Human Development Index components.' },
    { publisher: 'UNESCO Institute for Statistics', what: 'Adult literacy rate', years: '2020', note: 'Latest published adult literacy figure.' },
    { publisher: 'Destatis — Statistical Country Profile Indonesia', what: 'Life expectancy by sex, land area cross-check', years: '2024', note: 'Compiled from World Bank WDI and UN sources.' },
  ],
};
