// 原始快照的 name / sector 是來源識別值，切勿覆寫；本檔僅供圖表、表格及匯出資料顯示。
import { canonicalCompanyName } from "./taxonomy.mjs";

export const COMPANY_NAME_ZH = Object.freeze({
  "NVIDIA":"輝達（NVIDIA）",
  "Arm Holdings":"安謀（Arm）",
  "Apple":"蘋果",
  "Alphabet (Google)":"Alphabet（Google 母公司）",
  "Microsoft":"微軟",
  "Amazon":"亞馬遜",
  "TSMC":"台積電",
  "SpaceX":"SpaceX（太空探索科技）",
  "Meta Platforms (Facebook)":"Meta（臉書母公司）",
  "Broadcom":"博通",
  "Saudi Aramco":"沙烏地阿美",
  "Tesla":"特斯拉",
  "Samsung":"三星電子",
  "Micron Technology":"美光科技",
  "Berkshire Hathaway":"波克夏",
  "Eli Lilly":"禮來",
  "Philip Morris International":"菲利普莫里斯國際",
  "AMD":"超微（AMD）",
  "SK Hynix":"SK 海力士",
  "JPMorgan Chase":"摩根大通",
  "Walmart":"沃爾瑪",
  "Visa":"維薩（Visa）",
  "Exxon Mobil":"埃克森美孚",
  "ASML":"艾司摩爾（ASML）",
  "Johnson & Johnson":"嬌生",
  "Intel":"英特爾",
  "CXMT":"長鑫存儲",
  "Mastercard":"萬事達卡",
  "Tencent":"騰訊",
  "AbbVie":"艾伯維",
  "Palantir":"帕蘭提爾",
  "Cisco":"思科",
  "Oracle":"甲骨文",
  "China Construction Bank":"中國建設銀行",
  "Costco":"好市多",
  "Applied Materials":"應用材料",
  "Lam Research":"科林研發",
  "Chevron":"雪佛龍",
  "Bank of America":"美國銀行",
  "Caterpillar":"卡特彼勒",
  "Coca-Cola":"可口可樂",
  "Dell":"戴爾",
  "Agricultural Bank of China":"中國農業銀行",
  "Roche":"羅氏",
  "Merck":"默沙東",
  "ICBC":"中國工商銀行",
  "Procter & Gamble":"寶僑",
  "UnitedHealth":"聯合健康集團",
  "Palo Alto Networks":"派拓網路",
  "Bank of China":"中國銀行",
  "HSBC":"匯豐控股",
  "General Electric":"奇異",
  "MediaTek":"聯發科",
  "Delta Electronics":"台達電",
  "Foxconn (Hon Hai Precision Industry)":"鴻海",
  "ASE Group":"日月光投控",
  "Nan Ya Plastics":"南亞塑膠",
  "Fubon Financial":"富邦金控",
  "Unimicron":"欣興電子",
  "United Microelectronics":"聯華電子",
  "Nanya Technology":"南亞科技",
  "Cathay Financial Holding":"國泰金控",
  "Quanta Computer":"廣達電腦",
  "CTBC Financial Holding":"中信金控",
  "Yageo":"國巨",
  "Wiwynn":"緯穎",
  "Accton Technology":"智邦科技",
  "Chunghwa Telecom":"中華電信",
  "Global Unichip Corp.":"創意電子",
  "Formosa Petrochemical":"台塑石化",
  "Taishin Financial Holdings":"台新金控",
  "Foxconn":"鴻海",
  "UMC":"聯華電子"
});

export const SECTOR_NAME_ZH = Object.freeze({
  "Semiconductors":"半導體",
  "Hardware":"電腦與硬體",
  "Electronics/Hardware":"電子與硬體",
  "Software/Internet":"軟體與網際網路",
  "Industrials/Auto/Aerospace":"工業／汽車／航太",
  "Energy":"能源",
  "Financials":"金融",
  "Healthcare":"醫療保健",
  "Consumer/Retail":"消費與零售",
  "Materials/Energy":"原物料與能源",
  "Telecom":"電信",
  "Other/Unclassified":"其他／未分類",
  "Unclassified":"其他／未分類"
});

export function displayCompanyName(name) {
  return COMPANY_NAME_ZH[canonicalCompanyName(name)] ?? name;
}

export function displaySectorName(sector) {
  const value = sector || "Other/Unclassified";
  if (!(value in SECTOR_NAME_ZH)) throw new Error("尚未建立中文產業名稱：" + value);
  return SECTOR_NAME_ZH[value];
}

export function formatMarketCapUsd(n) {
  if (!Number.isFinite(n)) throw new Error("市值不是有效數字：" + n);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + (abs >= 1e12 ? (abs / 1e12).toFixed(3) + "兆" : (abs / 1e8).toFixed(1) + "億");
}
const csvValue = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
export function marketCsv(snapshot, key) {
  const group = snapshot.market_cap?.[key];
  if (!group?.rows) throw new Error("找不到指定市值資料：" + key);
  const header = ["排名","公司名稱","產業分類","市值（美元）","快照日期","採集時間（UTC）","原始公司名稱","原始產業代碼","原始證券代號"];
  const body = group.rows.map(row => [
    row.rank, displayCompanyName(row.name), displaySectorName(row.sector),
    row.market_cap_usd, snapshot.as_of, snapshot.collected_at,
    row.name, row.sector, row.ticker ?? ""
  ].map(csvValue).join(","));
  return "\uFEFF" + [header.map(csvValue).join(","), ...body].join("\n") + "\n";
}

// 未收錄中文名稱的公司不得默默退回英文圖表。
export function assertDisplayCoverage(snapshot) {
  for (const group of ["global_top50","taiwan_top20"]) {
    for (const row of snapshot.market_cap?.[group]?.rows ?? []) {
      displaySectorName(row.sector);
      if (!/[\u3400-\u9fff]/u.test(displayCompanyName(row.name)))
        throw new Error("未建立中文公司顯示名稱：" + row.name + "（" + group + "）");
    }
  }
}
