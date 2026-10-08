const DEFAULT_HEADERS = {
  "user-agent": "signal-notes-market-data/1.0 (+https://github.com/tibame201020/signal-notes)",
  "accept-language": "en-US,en;q=0.9",
  "accept": "text/html,application/xhtml+xml"
};

export const SOURCES = {
  marketCap: {
    global: "https://companiesmarketcap.com/",
    taiwan: "https://companiesmarketcap.com/taiwan/largest-companies-in-taiwan-by-market-cap/"
  },
  sovereign10y: {
    US: { name: "美國", url: "https://tradingeconomics.com/united-states/government-bond-yield" },
    AU: { name: "澳洲", url: "https://tradingeconomics.com/australia/government-bond-yield" },
    JP: { name: "日本", url: "https://tradingeconomics.com/japan/government-bond-yield" },
    DE: { name: "德國", url: "https://tradingeconomics.com/germany/government-bond-yield" },
    FR: { name: "法國", url: "https://tradingeconomics.com/france/government-bond-yield" },
    GB: { name: "英國", url: "https://tradingeconomics.com/united-kingdom/government-bond-yield" },
    CN: { name: "中國", url: "https://tradingeconomics.com/china/government-bond-yield" }
  }
};

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(value) {
  return decodeHtml(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

async function fetchText(url, { retries = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        redirect: "follow",
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? lastError}`);
}

function parseMarketCapUsd(text) {
  const match = text.replace(/,/g, "").match(/\$\s*([0-9.]+)\s*([TBM])/i);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toUpperCase();
  const multiplier = unit === "T" ? 1e12 : unit === "B" ? 1e9 : 1e6;
  return value * multiplier;
}

function parsePercent(text) {
  const match = text.match(/([-+]?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

function parseCompanyRows(html, limit) {
  const rows = html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  const companies = [];

  for (const row of rows) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(match => stripTags(match[1]));

    if (!cells.length) continue;

    const rankCell = cells.find(cell => /^\d+$/.test(cell));
    const capCell = cells.find(cell => /^\$\s*[0-9,.]+\s*[TBM]$/i.test(cell));
    if (!rankCell || !capCell) continue;

    const rank = Number(rankCell);
    if (!Number.isInteger(rank) || rank < 1 || rank > limit) continue;

    const nameMatch = row.match(/class=["'][^"']*company-name[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const codeMatch = row.match(/class=["'][^"']*company-code[^"']*["'][^>]*>([\s\S]*?)<\//i);

    const rankIndex = cells.indexOf(rankCell);
    const fallbackNameCell = cells[rankIndex + 1] ?? "";
    const name = nameMatch ? stripTags(nameMatch[1]) : fallbackNameCell;
    const ticker = codeMatch ? stripTags(codeMatch[1]) : null;

    const capIndex = cells.indexOf(capCell);
    const priceCell = cells[capIndex + 1] ?? null;
    const todayCell = cells.slice(capIndex + 1).find(cell => /%/.test(cell)) ?? null;
    const country = cells.at(-1) ?? null;

    companies.push({
      rank,
      name,
      ticker,
      market_cap_usd: parseMarketCapUsd(capCell),
      market_cap_display: capCell,
      price_display: priceCell,
      daily_price_change_pct: todayCell ? parsePercent(todayCell) : null,
      country
    });
  }

  companies.sort((a, b) => a.rank - b.rank);

  if (companies.length < Math.min(limit, 10)) {
    throw new Error(`CompaniesMarketCap parser returned only ${companies.length} rows (expected ${limit})`);
  }

  return companies.slice(0, limit);
}

function parseTradingEconomicsYield(html, countryName) {
  const text = stripTags(html);
  const actualMatch = text.match(/\bActual\s+([0-9]+(?:\.[0-9]+)?)/i);
  if (!actualMatch) {
    throw new Error(`Could not parse 10Y yield for ${countryName}`);
  }

  const dateMatch =
    text.match(/last updated on ([A-Za-z]+ \d{1,2}) of (\d{4})/i) ??
    text.match(/on ([A-Za-z]+ \d{1,2}, \d{4})/i);

  let sourceDate = null;
  if (dateMatch) {
    const raw = dateMatch.length === 3 ? `${dateMatch[1]}, ${dateMatch[2]}` : dateMatch[1];
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.valueOf())) {
      sourceDate = parsed.toISOString().slice(0, 10);
    }
  }

  return {
    yield_pct: Number(actualMatch[1]),
    source_date: sourceDate
  };
}

export async function getGlobalTopCompanies(limit = 50) {
  const url = SOURCES.marketCap.global;
  const html = await fetchText(url);
  return {
    source: { provider: "CompaniesMarketCap", url },
    rows: parseCompanyRows(html, limit)
  };
}

export async function getTaiwanTopCompanies(limit = 20) {
  const url = SOURCES.marketCap.taiwan;
  const html = await fetchText(url);
  return {
    source: { provider: "CompaniesMarketCap", url },
    rows: parseCompanyRows(html, limit)
  };
}

export async function getSovereign10YYields() {
  const entries = await Promise.all(
    Object.entries(SOURCES.sovereign10y).map(async ([code, item]) => {
      const html = await fetchText(item.url);
      const parsed = parseTradingEconomicsYield(html, item.name);
      return [code, {
        country: item.name,
        ...parsed,
        source: { provider: "Trading Economics", url: item.url }
      }];
    })
  );

  return Object.fromEntries(entries);
}
