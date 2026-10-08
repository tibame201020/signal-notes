---
title: "Investment Outlook｜10/08 投資自己：權限感知檢索與 Durable Execution"
slug: "investment-skills-2026-10-08"
description: "從 10/08 GitHub Agent-scale 改造與高資金成本延伸兩項稀缺能力：ACL-aware 檢索資料平面及具租約／冪等的可恢復工作流。附四週交付與量測要求。"
publishedAt: 2026-10-08
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

## 由當日資訊推導的能力需求

[10/08 Software 前沿](https://tibame201020.github.io/signal-notes/articles/daily-software-2026-10-08/) 的 [GitHub Agent-scale Git 基礎設施報告](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/) 顯示：大量 Agent 同時讀歷史、寫分支、並行工作，正在改變底層資料與執行負載。[10/08 財經前沿](https://tibame201020.github.io/signal-notes/articles/daily-finance-2026-10-08/)則指出資金成本仍高，長任務系統不只要可靠，還需要可衡量成本。這兩條訊號和[群體化論點](https://tibame201020.github.io/signal-notes/articles/huggingface-agent-civilization/)結合後，得到兩個可遷移的技能投資方向。

## 一、ACL-aware Retrieval：建構有授權的企業上下文資料平面

Agent 之間共享資料時，重要問題不只是語義相似度，而是誰可以讀到哪個版本、這份資料是否過期，以及能不能重建來源。需要掌握的系統能力：

- **文件與索引 schema：** document ID、tenant、user ACL、source URI、version、content hash、updatedAt；修改或撤權要能使快取失效。
- **檢索架構：** 比較 BM25、向量檢索、hybrid ranking、reranker。使用 filter-before-rank 做 tenant 與 ACL 控制，不能要求模型替你判定授權。
- **結果評估：** recall@10、MRR、ACL leakage count、index freshness、P50/P95 latency；分開觀察搜尋品質與安全隔離。
- **Provenance：** 每段上下文保留真正可驗證的文件版本及查詢權限決策；回答可以對應到來源，不以模型口述作稽核。

**四週投入：** 第1週建立三租戶、1,000筆文件與 50 題查詢基準；第2週加入 ACL 與撤權重索引；第3週加入混合檢索與更新事件；第4週整理可部署 API、比較曲線及安全測試。

**交付：** schema、資料平面服務、基準資料與授權回歸矩陣。**驗收：** 跨租戶未授權返回為零、每個結果可回溯版本、可量測索引更新延遲與 recall@10。這能轉移至企業知識服務、金融審計與軟體工程平台。

## 二、Durable Execution：大量 Agent 的租約、故障恢復與副作用一致性

當外部工具可能重試、Worker 可能死亡，最難處理的是：工作被重送，舊 Worker 復活，或某個外部寫入成功卻遺失回應。真正需要的不是單純增加工作槽。

- **狀態機：** queued → leased → running → committing → finished/failed。每個 job 保留 attempt、lease deadline、fencing epoch、idempotency key、trace ID，將狀態持久化。
- **租約與 fencing：** lease 到期可回收槽，但舊 epoch 不能再提交結果；用 CAS 或單調遞增版本避免舊 Worker 汙染狀態。
- **Outbox / compensation：** 對有副作用的 API 執行去重，不能保證 exactly-once 的外部行為時保留 reconciliation。
- **背壓與觀測：** 以 P95 queue time、重送率、重複副作用、成本／成功任務和完整終態做容量決策。

**四週投入：** 第1週以 PostgreSQL/SQLite 建 event log 和 state machine；第2週實作 lease fencing 與副作用冪等；第3週用100個模擬任務執行 worker kill、重送、斷線測試；第4週加 OTel traces、效能圖和可部署範例。

**交付：** runner、事件 schema、故障注入測試、可重播 traces。**驗收：** 所有任務存在可追溯終態；lease 能回收；重播操作不導致雙重扣款或重複副作用。它能轉移至 CI、遠端工具代理、金融與企業自動化。

## 技能投入的取捨

| 技能 | 因何需要 | 可以驗證的最小成果 | 長期價值 |
| --- | --- | --- | --- |
| 權限感知資料平面 | Agent-scale 多來源上下文與歷史版本 | 多租戶 ACL 檢索 API＋基準報告 | 資料治理、企業搜尋、Agent 平台 |
| Durable Execution | 並行任務、故障重送與高資金成本 | 可恢復執行器＋負載／錯誤注入結果 | 分散式系統、雲端執行、CI |

**我會把權限感知資料平面排在第一。** 今天的 GitHub 工程新訊號令檢索、歷史與資料權限的重要性提升；Durable Execution 則是能將這些上下文可靠用於實際任務的第二項核心能力。這是從當天前沿得到的投入順序，而非根據昨天推薦先選技能。

**依據：** [GitHub Agent-scale Git](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/)、[Software 10/08](https://tibame201020.github.io/signal-notes/articles/daily-software-2026-10-08/)、[財經 10/08](https://tibame201020.github.io/signal-notes/articles/daily-finance-2026-10-08/)。
