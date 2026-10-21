---
title: "每日前沿｜台股買入價篩選：資料不足，暫無正式價位"
slug: "daily-stock-prices-2026-10-22"
description: "凍結前一台股交易日與成交額門檻，七家候選未能驗證完整量價，不提供虛構區間。"
publishedAt: 2026-10-22
category:
  name: "每日前沿"
  slug: "daily-digest"
tags:
  - name: "台股買入價篩選"
    slug: "stock-prices"
draft: false
featured: false
---

> **結果：無合格標的、無正式買入價。** 臺北 10/22 05:00 截稿，前一交易日為 10/21；官方完整開高低收、股數、成交額與二十日樣本未能核實。[可追溯研究資料](https://github.com/tibame201020/signal-notes/blob/main/data/investment/entry-screenings/2026-10-22.json)。

## 母體與資料缺口
依[輝達正式供應商公告](https://nvidianews.nvidia.com/news/nvidia-introduces-dsx-pod-ai-factories-to-accelerate-europes-infrastructure-deployment)及晶圓製造訊號，初篩台達電（2308）、鴻海（2317）、廣達（2382）、緯創（3231）、技嘉（2376）、和碩（4938）、台積電（2330）。七家全為**待驗證**，不是全市場完成排名，亦未證實任何一家符合流動性門檻。

## 流動性與價位公式
每檔須同時證明 10/21 成交額及最近二十個有效交易日平均成交額皆至少**新台幣一億元**。二十日均線為官方收盤平均；十四期真實波幅（ATR14）為高低價與前收差的最大值之十四期平均。技術觀察區＝前收減 **2.5 至 1.5 倍 ATR14**，依價格級距取整；折價率＝（前收－觀察價）／前收。還須獨立核對每股盈餘、自由現金流、保守估值、量價及停牌異常。[證交所歷史資料入口](https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=html&stockNo=2308)。缺輸入不計算價格。

## 海外時點與反證
美、日、韓十月二十一日交易時段已結束，但未取得可稽核的正式收盤與採集時分，不報漲跌；風險偏好、半導體、匯率及資金成本的傳導仍待驗證。**已低於買入門檻：無核實標的；未達但可能觸價：無核實標的。** 停牌、重大異常、流動性不足、財報修正或波幅失效一律重篩，不推測命中率。
