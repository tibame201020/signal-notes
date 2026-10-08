# Market data collector

這一層只負責「固定、可重複取得」的市場資料，不做新聞搜尋或趨勢敘事。

## 固定函式

- `getGlobalTopCompanies(50)`：全球前 50 大企業市值。
- `getTaiwanTopCompanies(20)`：台灣前 20 大企業市值。
- `getSovereign10YYields()`：美國、澳洲、日本、德國、法國、英國、中國 10 年期公債殖利率。

來源集中在 `scripts/market-data/collectors.mjs` 的 `SOURCES`，來源失效時只改這一層，不讓每日文章重新探索取得方式。

## Snapshot

GitHub Actions 每天台灣時間約 04:20 執行：

```
node scripts/market-data/collect.mjs
```

輸出：

- `data/market/latest.json`
- `data/market/snapshots/YYYY-MM-DD.json`

collector 會使用 repo 自己累積的 snapshot 計算：

- 10 年債殖利率 1 / 3 / 7 日變化（bp）。
- 全球 Top 50、台灣 Top 20 的 1 / 3 / 7 日市值變化。

因此 05:00 每日文章應先讀 `data/market/latest.json`，不要重新搜尋這些固定數據。

## 失敗原則

固定資料抓取或解析失敗時，Action 應直接失敗；不得把昨日資料覆寫成今日資料。文章端若發現 `latest.json` 過期，也應明確標示資料未更新。
