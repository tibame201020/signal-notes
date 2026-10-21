---
title: "每日前沿｜軟體工程：短效授權與供應鏈驗收"
slug: "daily-software-2026-10-22"
description: "追蹤 GitHub 官方更新，設計軟體供應鏈、代理變更與身分生命週期的可測契約。"
publishedAt: 2026-10-22
category:
  name: "每日前沿"
  slug: "daily-digest"
tags:
  - name: "軟體工程"
    slug: "software"
draft: false
featured: false
---

## 主線
[GitHub 十月二十一日公告](https://github.blog/changelog/2026-10-21-github-cli-opt-in-to-expiring-auto-refreshing-oauth-tokens/)指出命令列工具新版提供可選的到期、自動更新 OAuth 授權模式。短效存取權杖降低長期洩漏風險，但舊有長期快取授權資訊的自動化可能在到期時失效。[GitHub 十月更新](https://github.blog/changelog/month/10-2026/)亦包含十月二十日套件防火牆公開預覽與依賴警示版本資訊。

## 架構與測試
工作身分應限定允許路徑、父版本雜湊與有效期限；修改流程採讀取、差異、測試、獨立回讀、發布。套件版本鎖定及來源完整性須獨立驗證。驗收包括授權到期後正常續用、惡意依賴阻擋、變更範圍拒絕與可重播測試回執。

## 昨日／近三日／近七日
昨日是十月二十一日授權公告；近三日對照十月二十日供應鏈防護；近七日參考十月十六日開源授權合規公告，避免只測安全而忽略授權。

**推論：** 授權生命週期、套件完整性及變更審查是三種獨立控制。**依據：** GitHub 兩日官方公告。**為什麼這樣判斷：** 身分驗證不能證明依賴無害，依賴掃描也不能證明代理修改正確。**反證：** 若未啟用保護或執行環境繞過，不能宣稱驗收成功。
