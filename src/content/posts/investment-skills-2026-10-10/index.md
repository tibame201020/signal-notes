---
title: "Investment Outlook｜10/10 投資自己：模型安全證據工程與基建現金流審核"
slug: "investment-skills-2026-10-10"
description: "從 10/09 模型安全揭露缺口及 Firmus IPO 失利、SK 擴廠水電瓶頸，推導兩項可驗收技能：可追溯評測證據與資料中心專案財務建模。"
publishedAt: 2026-10-10
category:
  name: "Investment Outlook"
  slug: "investment-outlook"
tags:
  - name: "投資自己"
    slug: "skill-investment"
  - name: "可驗證技能"
    slug: "verifiable-skills"
draft: false
featured: false
---

> **10/10 的技能研究先從六篇當日前沿與[已發表論點](https://tibame201020.github.io/signal-notes/articles/huggingface-agent-civilization/)獨立出發**，不沿用昨天的技能清單或近期聊天中的特定專案。這次兩項能力分別處理「AI 模型證據缺口」與「實體基建融資估值缺口」，都能產出可執行作品。

## 一、模型發布的可追溯安全證據工程（Model Evidence Engineering）

**當日證據：** 10/09 SemiAnalysis 調查 857 次中國模型發布，只有 31 次有可對應特定模型的公開安全測試結果，9 次在發布前或當時公開。這衡量的是**公開揭露**，不是證明其餘模型沒做測試。10/09 韓日資安事件則增加企業對工具和模型審計的實務需求。

**依據：** [Reuters｜模型安全揭露](https://www.reuters.com/legal/litigation/china-ai-developers-publish-safety-tests-just-36-model-releases-report-finds-2026-10-09/)、[Reuters｜韓日網攻](https://www.reuters.com/legal/litigation/south-korea-japan-buffeted-by-hacks-ai-lowers-bar-cybercriminals-2026-10-09/)、[當日 Software 前沿](https://tibame201020.github.io/signal-notes/articles/daily-software-2026-10-10/)。

**為什麼值得投入：** 企業採購與合規不只要知道模型「聲稱安全」，還要能把每次執行結果連到**確切模型版本、評測集、測試時間、執行環境與核准決策**。這是可轉移到模型平台、資安治理與軟體供應鏈的稀缺工程能力。

### 必須深入的技術

- **證據 Schema：** `modelId`、`weightsDigest`、`runtimeDigest`、`evalSuiteDigest`、`datasetVersion`、`policyVersion`、`sampleCount`、`failures`、`confidenceInterval`、`timestamp`、`attestor`、`signature`。區分不可公開的原始測試資料與可供第三方驗證的摘要。
- **來源鏈：** release → build provenance → evaluation run → signed attestation → deployment gate。可研究 in-toto / SLSA provenance、Sigstore DSSE，實作簽章與驗證，但不要把簽名本身當作測試品質證明。
- **統計取捨：** 風險事件低基率下，只報成功率容易誤導；用 Wilson interval、分層抽樣、資料洩漏檢查與 false-negative 率。評測版本更換時禁止跨版混算。
- **安全閘：** 若簽章不符、版本漂移、樣本不足或超出 TTL，阻擋部署並產生具體原因。安全測試失敗不應自動改寫評測資料。

### 四週作品：`model-evidence-gate`

| 週次 | 產物 | 驗收門檻 |
| --- | --- | --- |
| 1 | JSON Schema + 20 組合法／非法 manifest | 不合法版本或欄位拒絕率 100% |
| 2 | 評測 runner + Wilson CI + 版本化 dataset | 固定種子重跑，結果差異可解釋 |
| 3 | DSSE 簽署與 release gate | 10 組偽造／過期證據全部拒絕 |
| 4 | 可查詢 dashboard + CI 發布決策 | 每個 release 100% 可追到 digest 與評測 run |

**展示方式：** GitHub repo + 一個假模型的 release pipeline，展示「版本改了但評測沒重跑」被 gate 拒絕。**市場價值：** 模型供應商、金融企業 AI 採購、平台資安、第三方模型驗證。門檻是自訂作品驗收，不是產業認證。

## 二、AI 資料中心／晶圓廠的專案現金流與電力瓶頸建模

**當日證據：** 10/09 Firmus 撤回 50 億美元 IPO，投資者質疑約 306 億美元股權估值與未交付資料中心；同日 SK 海力士表示新廠開工時間仍取決於水電配套。這兩件事把「擴產意願」和「可融資、可交付、可收款」的距離具體化。

**依據：** [Reuters｜Firmus 撤回 IPO](https://www.reuters.com/world/asia-pacific/australian-nvidia-backed-ai-data-centre-operator-firmus-shelves-ipo-2026-10-08/)、[Reuters｜SK 水電瓶頸](https://www.reuters.com/world/asia-pacific/sk-chairman-chey-says-chip-demand-keep-growing-fast-2026-10-09/)、[當日財經前沿](https://tibame201020.github.io/signal-notes/articles/daily-finance-2026-10-10/)。

**為什麼值得投入：** AI 計算需求再強，建設計畫仍需供電、供水、融資和租賃收入才能形成現金流。會把**MW、PUE、建置進度、利用率、利率、DSCR**連成模型的人，可以跨投資研究、資料中心營運、工程採購與專案融資工作。

### 必須深入的技術

- **實體限制：** `IT_load_MW`、`PUE`、`grid_connection_date`、`power_price_per_kWh`、`water_m3_day`、`commissioned_MW`。設備到貨≠通電≠通過驗收≠出租。
- **現金流模型：** 每月 `revenue = commissioned_MW × utilization × contracted_price`；扣電力、維護、折舊、租賃、稅與 CAPEX。計算 NPV、IRR、自由現金流、債務服務覆蓋率（DSCR = CFADS / debt service）。
- **融資取捨：** 低利用率或供電延誤會讓債務利息先到、營收後到；以 construction drawdown schedule 和利息資本化區分建設期／營運期。高 PUE 增加耗電和冷卻成本。
- **情境與反證：** 基準 18 個月通電；保守延後 9 個月、電價 +20%、利用率 -15%；樂觀提前 3 個月、利用率 +10%。以上是模型假設，**不是 Firmus 或 SK 的真實工程參數**。
- **估值邊界：** `EV = PV(FCFF) + terminal value`，股權價值須再扣淨債務；不可把已宣布投資額、工程合同金額和公司市值相加當「新增價值」。

### 四週作品：`infrastructure-cashflow-lab`

| 週次 | 產物 | 驗收門檻 |
| --- | --- | --- |
| 1 | `project.yaml`（MW/PUE/水電／施工里程碑）與檢查器 | 20 組非法輸入全部拒絕 |
| 2 | 60 個月現金流、CAPEX drawdown、NPV/IRR | 對 3 個手算基準誤差 <0.1% |
| 3 | 電力延遲、利用率、利率敏感度與 DSCR | 5×5 情境矩陣可重播，顯示 DSCR <1.0 的月份 |
| 4 | Web dashboard + CSV + 可讀投資備忘錄 | 改動供電日期能即時重算股權價值與融資缺口 |

**展示方式：** 一個 100MW **虛構案例**，輸入 YAML、生成月度 cash-flow CSV、DSCR/IRR 圖表與反證報告；對比「看似高估值」與「實際可融資」的差距。**市場價值：** AI 基建投資、半導體建廠、能源設備供應鏈、銀行授信與資本配置分析。

## 本期排序與前日差異

本期優先 **模型證據工程**與**基建專案現金流建模**。它們分別對應 10/09 新增的安全揭露統計與上市融資失敗／水電瓶頸；不是因為上次聊天討論過什麼。兩項作品都可在四週各投入每週 6–10 小時完成最小可展示版。

**驗收不是「看懂文章」，而是能拿出可執行程式、失敗案例、可重播測試和數據表。** 如果實測顯示評測證據無法改變部署決策、或專案融資對電力時程不敏感，就應重新檢查需求假說。
