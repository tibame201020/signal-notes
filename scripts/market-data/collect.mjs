import fs from "node:fs/promises";
import path from "node:path";
import {
  getGlobalTopCompanies,
  getTaiwanTopCompanies,
  getSovereign10YYields
} from "./collectors.mjs";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "market");
const SNAPSHOT_DIR = path.join(DATA_DIR, "snapshots");

function taipeiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function loadSnapshots() {
  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
  const names = (await fs.readdir(SNAPSHOT_DIR))
    .filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();

  const snapshots = [];
  for (const name of names) {
    try {
      snapshots.push(JSON.parse(await fs.readFile(path.join(SNAPSHOT_DIR, name), "utf8")));
    } catch {
      // A broken historical file must not block today's collection.
    }
  }
  return snapshots;
}

function findComparisonSnapshot(snapshots, asOf, daysBack) {
  const target = new Date(`${asOf}T00:00:00+08:00`);
  target.setUTCDate(target.getUTCDate() - daysBack);
  const targetDate = target.toISOString().slice(0, 10);

  return [...snapshots]
    .filter(snapshot => snapshot.as_of <= targetDate)
    .sort((a, b) => b.as_of.localeCompare(a.as_of))[0] ?? null;
}

function bondComparisons(current, snapshots) {
  const result = {};
  for (const [code, item] of Object.entries(current.sovereign_10y)) {
    result[code] = {};
    for (const days of [1, 3, 7]) {
      const prior = findComparisonSnapshot(snapshots, current.as_of, days);
      const priorYield = prior?.sovereign_10y?.[code]?.yield_pct;
      result[code][`d${days}_bp`] =
        typeof priorYield === "number"
          ? Number(((item.yield_pct - priorYield) * 100).toFixed(1))
          : null;
      result[code][`d${days}_base_date`] = prior?.as_of ?? null;
    }
  }
  return result;
}

function companyIndex(rows) {
  return new Map(rows.map(row => [row.ticker || row.name, row]));
}

function marketCapComparisons(currentRows, priorRows) {
  if (!priorRows?.length) return null;
  const prior = companyIndex(priorRows);
  const matched = currentRows
    .map(row => {
      const old = prior.get(row.ticker || row.name);
      if (!old || !old.market_cap_usd) return null;
      return {
        rank: row.rank,
        name: row.name,
        ticker: row.ticker,
        market_cap_usd: row.market_cap_usd,
        change_usd: row.market_cap_usd - old.market_cap_usd,
        change_pct: Number((((row.market_cap_usd / old.market_cap_usd) - 1) * 100).toFixed(3))
      };
    })
    .filter(Boolean);

  const currentTotal = currentRows.reduce((sum, row) => sum + (row.market_cap_usd ?? 0), 0);
  const priorTotal = priorRows.reduce((sum, row) => sum + (row.market_cap_usd ?? 0), 0);

  return {
    matched_count: matched.length,
    total_market_cap_usd: currentTotal,
    total_change_usd: currentTotal - priorTotal,
    total_change_pct: priorTotal
      ? Number((((currentTotal / priorTotal) - 1) * 100).toFixed(3))
      : null,
    companies: matched
  };
}

function addMarketCapComparisons(current, snapshots) {
  const out = {};
  for (const days of [1, 3, 7]) {
    const prior = findComparisonSnapshot(snapshots, current.as_of, days);
    out[`d${days}`] = {
      base_date: prior?.as_of ?? null,
      global_top50: marketCapComparisons(
        current.market_cap.global_top50.rows,
        prior?.market_cap?.global_top50?.rows
      ),
      taiwan_top20: marketCapComparisons(
        current.market_cap.taiwan_top20.rows,
        prior?.market_cap?.taiwan_top20?.rows
      )
    };
  }
  return out;
}

async function main() {
  const asOf = taipeiDate();
  const collectedAt = new Date().toISOString();

  const [globalTop50, taiwanTop20, sovereign10y] = await Promise.all([
    getGlobalTopCompanies(50),
    getTaiwanTopCompanies(20),
    getSovereign10YYields()
  ]);

  const historical = await loadSnapshots();

  const snapshot = {
    schema_version: 1,
    as_of: asOf,
    collected_at: collectedAt,
    market_cap: {
      global_top50: globalTop50,
      taiwan_top20: taiwanTop20
    },
    sovereign_10y: sovereign10y
  };

  snapshot.comparisons = {
    sovereign_10y: bondComparisons(snapshot, historical),
    market_cap: addMarketCapComparisons(snapshot, historical)
  };

  await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
  const json = JSON.stringify(snapshot, null, 2) + "\n";
  await fs.writeFile(path.join(SNAPSHOT_DIR, `${asOf}.json`), json);
  await fs.writeFile(path.join(DATA_DIR, "latest.json"), json);

  console.log(JSON.stringify({
    as_of: asOf,
    global_top50: globalTop50.rows.length,
    taiwan_top20: taiwanTop20.rows.length,
    sovereign_10y: Object.fromEntries(
      Object.entries(sovereign10y).map(([code, item]) => [code, item.yield_pct])
    )
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
