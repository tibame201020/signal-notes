---
title: "每日前沿｜金流與估值：全球資本仍高度集中在 AI，台灣集中度更極端"
slug: "daily-capital-flows-2026-10-07"
description: "2026-10-07 全球 Top 50、台灣 Top 20 市值 baseline、產業比例、成交與基金流向分析。"
publishedAt: 2026-10-07
category:
  name: "Daily Digest"
  slug: "daily-digest"
tags:
  - name: "Capital Flow"
    slug: "capital-flow"
  - name: "Valuation"
    slug: "valuation"
  - name: "Market Cap"
    slug: "market-cap"
draft: false
featured: false
---

> 本篇是這套日報的第一個估值 baseline。  
> 從下一次開始，會直接使用每日保存的同來源快照計算 1d / 3d / 7d 市值變化，避免用不同資料源倒推歷史估值。

## 全球前 50 大企業

本次 Top 50 合計市值約 **55.19 兆美元**。

![全球前十大企業市值](./global-top10-marketcap.svg)

以本次分類計算：

![全球前五十大企業產業占比](./global-top50-sector-share.svg)

| 產業 | Top 50 市值占比 |
| --- | ---: |
| 半導體與設備 | 29.5% |
| Software / Internet | 26.3% |
| Hardware | 12.7% |
| 金融 | 9.7% |
| 工業 / 汽車 / 航太 | 7.5% |
| 醫療 | 5.7% |
| 能源 | 5.0% |
| 消費 / 零售 | 3.6% |

半導體加 Software / Internet 已占 Top 50 約 **55.8%**；若再加 Hardware，科技相關市值約達 **68.5%**。

依 CompaniesMarketCap 當前價格變動粗估，Top 50 加權日變動約 **+0.97%**，對應約 **+5,350 億美元**市值。這是以當前市值權重與價格變化估算，不等同交易所正式總市值變化。

完整 baseline：[CSV](./global-top50-2026-10-07.csv)

## 全球資金流

截至 9 月 30 日的一週，全球股票基金淨流入約 **347.6 億美元**，前一週為 **443.1 億美元**。

也就是仍為淨流入，但流入速度約下降 **21.6%**。

因此目前可觀察到：

**估值仍向 AI / 科技集中，但新增資金沒有同步加速。**

這是一個重要差異。市值可以因價格上漲快速擴張，但真正的新資金流入已開始放慢。

## 台灣前 20 大企業

Top 20 合計市值約 **3.836 兆美元**。

其中台積電約 **2.501 兆美元**，單一公司約占 Top 20 的 **65.2%**。

![台灣前十大企業市值](./taiwan-top10-marketcap.svg)

![台灣前二十大企業產業占比](./taiwan-top20-sector-share.svg)

| 產業 | Top 20 市值占比 |
| --- | ---: |
| 半導體 | 78.1% |
| 電子 / Hardware | 13.0% |
| 金融 | 5.1% |
| 原物料 / 能源 | 2.9% |
| 電信 | 0.9% |

台灣不是單純「科技股占比較高」。

更準確地說，**Top 20 幾乎就是半導體與電子供應鏈的資本化結果。**

當日價格變動加權粗估約 **+1.20%**，約等於 **+460 億美元**市值。

完整 baseline：[CSV](./taiwan-top20-2026-10-07.csv)

## 台灣成交與 ETF 金流代理

TWSE 近期總成交值：

| 日期 | 成交值 |
| --- | ---: |
| 10/01 | NT$874.0B |
| 10/02 | NT$938.2B |
| 10/05 | NT$1,211.0B |
| 10/06 | NT$1,026.2B |

10 月 5 日出現明顯放量，10 月 6 日仍維持在 **1 兆元以上**。

10 月 6 日上市 ETF 總成交值約 **576.4 億元**。其中 0050 約 **82.4 億元**，半導體相關 00927 約 **20.5 億元**。

這裡的 ETF 成交額不是「淨申購」，所以只能作為資金活動強度代理，不能直接視為淨流入。

## 趨勢判斷

### 全球

資本仍持續向 AI、半導體與大型平台公司集中。

但全球股票基金流入速度下降，代表：

**價格集中度的上升速度，已快於新增資金流入速度。**

### 台灣

集中度比全球更極端。

只要 AI 半導體週期持續，這種結構會放大台灣市場上行；但如果先進製程、HBM 或 AI capex 預期反轉，同一個集中結構也會放大下行。

因此未來每天真正值得追蹤的不是只有 TAIEX 漲跌，而是：

**Top 20 市值集中度、半導體占比、成交強度與 ETF / 基金淨流向是否開始背離。**

## 資料來源

- [CompaniesMarketCap｜Global ranking](https://companiesmarketcap.com/)
- [CompaniesMarketCap｜Taiwan ranking](https://companiesmarketcap.com/taiwan/largest-companies-in-taiwan-by-market-cap/)
- [TWSE｜Daily Trading Highlights](https://www.twse.com.tw/en/exchangeReport/FMTQIK?date=&response=html)
- [TWSE｜Market Summary](https://www.twse.com.tw/en/exchangeReport/MI_INDEX?response=html)
- [TWSE｜ETF institutional information](https://wwwc.twse.com.tw/zh/ETFortune-institute/index)
- [Reuters｜Global equity fund flows](https://www.reuters.com/world/china/global-markets-flows-graphic-2026-10-02/)
