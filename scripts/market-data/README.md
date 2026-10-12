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

## 中文顯示層

來源的 `name`、`ticker`、`sector` 維持原值，作為跨日配對和來源追溯的欄位。不得以中文名稱直接覆寫 `data/market/` 快照。

`scripts/market-data/display-zh.mjs` 以固定對照表提供中文公司名稱及中文產業類別；`render-trends.mjs` 讀入原始值完成計算後，將顯示用文字轉成繁體中文，並輸出**中文欄位置前、保留來源英文字段**的 UTF-8 BOM CSV。未收錄的新公司或產業，必須更新對照表，不能默默回退為全英文。

本機或 CI 可執行 `node scripts/market-data/render-trends.mjs YYYY-MM-DD` 以生成當日圖表和 `global-top50-YYYY-MM-DD.csv`／`taiwan-top20-YYYY-MM-DD.csv`。發布檢查同時檢查圖內 SVG 文字及 CSV 中文欄位。

## 避免背景刷新覆寫已發布文章

04:20 的市場資料工作只更新 `data/market/`，不再在每次資料採集時重新輸出或改寫已發布的 `src/content/posts/daily-capital-flows-*/` 圖表與文字。每日 05:00 的文章發布流程必須在取得同日資料後，用 `render-trends.mjs YYYY-MM-DD` 建立並提交當期繁體中文 SVG／CSV，確保圖表、引用來源與文章敘述對應同一份資料版本。若原始快照較原訂時間晚到，必須在文章明確標記補採時間，人工核對敘述後再更新，不能由資料工作靜默改寫歷史文章。
