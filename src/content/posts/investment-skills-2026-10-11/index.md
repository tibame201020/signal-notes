---
title: "Investment Outlook｜10/11 投資自己：外部副作用核可與能源供應資料血緣"
slug: "investment-skills-2026-10-11"
description: "從 10/10 一手報告推導兩項可移轉能力：Agent 真實工具提交的安全交易閘，以及多資料日期的能源物流情境分析。"
publishedAt: 2026-10-11
category:
  name: "Investment Outlook"
  slug: "investment-outlook"
tags:
  - name: "投資自己"
    slug: "skill-investment"
draft: false
featured: false
---

> 10/11 當日前沿及[已發布的多 Agent 群體論點](https://tibame201020.github.io/signal-notes/articles/huggingface-agent-civilization/)是輸入；選擇以下兩項不是沿用聊天中的專案或昨天的技能清單。

## 能力一：外部副作用的 Transaction Gate 與委託權限驗證

**訊號：** [Anthropic 10/09 原始調查](https://www.anthropic.com/news/investigating-unintended-model-actions)證實模型曾將本應為範例的內容提交到真實警方表單；[GitHub 10/10](https://github.blog/changelog/2026-10-10-new-controls-and-chat-improvements-in-copilot-for-jetbrains/)可由組織決定 MCP server 是否自動啟動。這提出的問題不只是沙盒，而是**哪些外部動作有不可逆副作用**。

**架構：** tool intent → schema validator → risk classifier → origin／principal／delegation chain → explicit approval → idempotency ledger → executor → signed audit receipt。對電子郵件、表單提交、刪改遠端資產分類 `sideEffect=external-write`；要求 `requestId, actor, delegatedBy[], resourceUri, action, argumentsHash, policyVersion, approvalId, expiry, executionReceipt`。設計 default deny，禁止 Agent B 只用自身高權限代替無權限的 A 執行敏感外部寫入。

**取捨：** 高風險動作一律核准，會犧牲自動化速度；可建立風險與作用域對應的限時批次批准，不准以文字提示取代 PEP。冪等鍵要防止 retry 重複寄送，outbox／receipt 處理呼叫後失去回應的不確定狀態。

| 週 | 可運作成果 | 驗收 |
| --- | --- | --- |
| 1 | JSON Schema + policy fixtures + 模擬表單／mail API | 20 個授權與拒絕案例全數可重播 |
| 2 | PEP + approve/reject + idempotency ledger | 100 次重試不產生重複提交 |
| 3 | A→B 委託鏈 + 不可變稽核事件 | 10 類間接越權測試全部拒絕 |
| 4 | 可查詢 trace UI + 故障注入與效能量測 | 審核路徑 P95 <50ms（不含人工核准），高風險未核准副作用 0 件 |

**可展示作品：** `external-action-gate`，含假警察表單沙盒（僅本地測試）、API contract、失敗重播影片與 CI 報告。可轉移到企業工作流、金融簽核與代理平台。

## 能力二：事件時間與觀測時間分離的能源供應／資本市場資料系統

**訊號：** [Reuters 10/09 柴油供應宣示](https://www.reuters.com/business/energy/trump-big-announcement-coming-up-diesel-2026-10-09/)與[本日金流篇](https://tibame201020.github.io/signal-notes/articles/daily-capital-flows-2026-10-11/)顯示：宣示量、實際出貨、價格、不同時點抓取的市值及基金淨流，都是不同事件。混用時間戳會產生錯誤交易結論。

**架構：** `sourceEventTime, publishedAt, observedAt, marketSession, instrument, unit, currency, sourceUrl, vintage, transformation, lineage`；收集事件與報價到 append-only 原始層，再做不可變 vintage snapshot，依市場日曆與 source_date 去重。將 `announcement`／`shipment`／`delivered`／`marketQuote`／`fundNetFlow` 建模為互斥事件類型；市值變動禁止自動映射現金淨流。

**演算法與取捨：** 以 event-time window 與 watermark 對遲到新聞回補，禁止週末 carry-forward 當新交易；FX 按報價時點換算，缺數據標記 `stale` 而非填零。建立能源衝擊情境：油價→煉油價差→航油→企業成本→可轉嫁能力；房貸利率則另設政策利率與銀行重定價時差，避免長債價格的假因果。

| 週 | 可運作成果 | 驗收 |
| --- | --- | --- |
| 1 | 事件 schema、來源擷取、unit 正規化 | 原始事件100%可追 sourceUrl／時間戳 |
| 2 | SQLite／DuckDB vintage store + 市場行事曆 | 週末重複行情被排除，新舊快照不互相覆寫 |
| 3 | FX／債率／油價／實物交付四類序列與情境 | 5 個缺值／遲到／更正注入可正確重算 |
| 4 | 多日圖表、血緣檢視及假因果反例報告 | 兩次 rerun 輸出 hash 一致，對不完整期間清楚顯示缺口 |

**可展示作品：** `energy-vintage-lab`（CSV、schema、可重播 collector、跨日 chart 與驗收）。市場價值在商品風控、企業財務、投資研究資料工程及供應鏈經營分析；比單純記住油價或某套程式庫更可移轉。

## 為何本期是這兩項

兩者分別處理**外部動作的可控性**與**市場／物流資料的可追溯性**。相同之處是都把不確定性與可逆性設計進系統，而非事後用文字聲明掩蓋。每項以 2–4 週、可執行作品及可測試門檻驗收，若今天沒有新的公司價格資料，不需要為了選題硬湊另一個軟硬體名額。
