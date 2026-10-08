---
title: "Investment Outlook｜10/07 投資自己：異質算力成本模型與安全電腦操作"
slug: "investment-skills-2026-10-07"
description: "由 10/07 AI、半導體與資安前沿挑出兩項能力：AI 工作負載的單位成本／容量建模，以及具授權邊界的電腦操作執行層；附四週路線與驗收成果。"
publishedAt: 2026-10-07
updatedAt: 2026-10-08
category:
  name: "Investment Outlook"
  slug: "investment-outlook"
tags:
  - name: "投資自己"
    slug: "skill-investment"
  - name: "系統工程"
    slug: "systems-engineering"
draft: false
featured: false
---

## 為什麼是這兩項

當天 [AI 前沿](https://tibame201020.github.io/signal-notes/articles/daily-ai-2026-10-07/) 聚焦 AI 在真實工作中的電腦操作；[半導體前沿](https://tibame201020.github.io/signal-notes/articles/daily-semiconductor-2026-10-07/) 指向 2027 年實體晶片供應；[Software 前沿](https://tibame201020.github.io/signal-notes/articles/daily-software-2026-10-07/) 則指向動態工作流程與安全驗證。我的判斷是：**「能算出 AI 系統真實單位成本」與「能安全操作真實環境」的工程能力，會比一般工具組裝更難替代。** 這不是從特定專案倒推出兩項學習清單。

## 一、AI 工作負載的 Unit Economics + Capacity Engineering

### 要掌握的問題

AI 模型可以在 GPU 上推論，但 end-to-end 的 Agent 工作還可能包含瀏覽器啟動、網路等待、CPU 推理前後處理、DRAM 壓力、SSD 快照與多模型呼叫。真正的工程問題是：**每一千次完成任務消耗多少硬體資源，以及瓶頸移到哪裡？**

不要只看 token/s；至少拆成到達率 λ、成功完成率、P50/P95 延遲、併發執行個數、資源時間與每個成功結果的成本。用 Little's Law：平均在途工作量 L＝λW，但前提是穩態與統計口徑一致。用 saturation curve 看 1→8→32→64 個同時任務時 CPU／RAM／GPU／I/O 哪個先飽和。

### 四週投入

- **第 1 週：** 建同一批 100–300 個可重播的任務；固定模型、任務內容與成功判準，量測 token/s、P95、失敗率與 CPU/GPU/DRAM 使用量。
- **第 2 週：** 增加 headless browser、檔案讀寫與兩種 SSD/網路延遲情境；拆分模型推論與工具執行的佔用時間。
- **第 3 週：** 比較共用 worker 池、每會話獨立執行環境與時間分片；建立每 1,000 次成功任務的硬體成本試算表。
- **第 4 週：** 用同一 workload 比較 CPU 強化、RAM 增量、GPU 強化或儲存快取四種方案；輸出敏感度報告。

**交付物：** 可重播 workload、Prometheus/OTel 監測、成本模型試算、四種部署配置的資源瓶頸曲線。**驗收：** 每個配置重測三次，附負載曲線與方差；不能以虛構 TPS 或無來源租機價格填表。

**技能價值：** 可以評估雲端機櫃採購、AI 服務定價與 Agent 部署規模。它也能幫助區分「硬體需求上升」與「硬體供應商有能力提高利潤」。

## 二、安全電腦操作執行層：Intent-to-Action Boundary

### 要掌握的問題

[OpenAI 的電腦操作研究](https://openai.com/index/advancing-computer-use-with-ironclad/) 把模型輸出接近真實操作；[Anthropic 資安驗證](https://www.anthropic.com/news/cyber-verification-program) 則提醒：若工具真的可操作系統，指令來源和執行權限必須可追蹤。這與已發表的 [Agent 群體化論點](https://tibame201020.github.io/signal-notes/articles/huggingface-agent-civilization/) 相呼應，但學習目標不是證明論點。

要研究的不只是 allowlist，而是明確區分：發出意圖的使用者、提供環境資料的網頁或檔案、提出操作建議的 Agent、真正持有系統權限的 Executor。任何網頁或工具輸出都不得自行升級為授權來源。

### 四週投入

- **第 1 週：** 設計 typed action schema：principal、resource、verb、precondition、approval、idempotency key、trace ID，並完成權限矩陣。
- **第 2 週：** 建容器化 browser executor：只執行結構化 action，檢查資源來源與指定 URL/檔案範圍；將模型回覆視為提議而非權限。
- **第 3 週：** 產生惡意網頁/工具回應樣本，測 prompt injection、跨站讀寫、非預期下載與憑證轉送，並建立 regression suite。
- **第 4 週：** 整理 action record 與審計查詢，展示同一個要求的 request→approve→execute→result 全鏈路。

**交付物：** Executor SDK、政策文件、可重放的安全案例與 20+ 項 positive/negative tests。**驗收：** 未經核准的副作用應拒絕；合法動作仍可完成；稽核必須能查出誰核准、執行的內容與結果。

## 推論與取捨

這兩項能力對應不同的投入報酬：第一項將 AI 熱潮轉化為可量測的容量／成本決策；第二項將 Agent 操作能力轉化為企業能容忍的安全工作方式。若時間只夠一項，我會優先選 **工作負載成本建模**，因為它跨模型、跨雲、跨軟硬體，而且 10/07 的 AI 與供應鏈訊號同時支持這個需求。

技術依據：[GitHub 動態工作流程](https://github.blog/changelog/2026-10-01-dynamic-workflows-in-copilot-cli-and-the-copilot-app/)、[OpenAI 電腦操作研究](https://openai.com/index/advancing-computer-use-with-ironclad/)、[AMD 供應規劃](https://www.reuters.com/world/asia-pacific/amd-plans-substantially-increase-supply-2027-ceo-says-2026-10-06/)。
