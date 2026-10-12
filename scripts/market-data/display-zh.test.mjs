import { test } from "node:test";
import assert from "node:assert/strict";
import { displayCompanyName, displaySectorName, formatMarketCapUsd, marketCsv, assertDisplayCoverage } from "./display-zh.mjs";

test("原始公司與產業識別碼保留，顯示名稱轉繁體中文", () => {
  assert.equal(displayCompanyName("TSMC"),"台積電");
  assert.equal(displayCompanyName("Foxconn (Hon Hai Precision Industry)"),"鴻海");
  assert.equal(displayCompanyName("NVIDIA"),"輝達（NVIDIA）");
  assert.equal(displaySectorName("Semiconductors"),"半導體");
  assert.equal(displaySectorName("Electronics/Hardware"),"電子與硬體");
  assert.throws(()=>displaySectorName("Unknown"),/未建立中文/);
});
test("市值單位與帶來源原文的繁體中文 CSV", () => {
  assert.equal(formatMarketCapUsd(2351000000000),"2.351兆");
  assert.equal(formatMarketCapUsd(234700000000),"2347.0億");
  const snapshot={as_of:"2026-10-12",collected_at:"2026-10-11T23:44:55Z",market_cap:{global_top50:{rows:[{rank:1,name:"TSMC",sector:"Semiconductors",market_cap_usd:2351000000000,ticker:"TSM"}]},taiwan_top20:{rows:[{rank:1,name:"TSMC",sector:"Semiconductors",market_cap_usd:2351000000000,ticker:"2330"}]}}};
  assert.doesNotThrow(()=>assertDisplayCoverage(snapshot));
  const csv=marketCsv(snapshot,"global_top50");
  assert.ok(csv.includes('"公司名稱","產業分類"'));
  assert.ok(csv.includes('"台積電","半導體"'));
  assert.ok(csv.includes('"TSMC","Semiconductors"'));
});
