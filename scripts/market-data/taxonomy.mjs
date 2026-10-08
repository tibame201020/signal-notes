export const SECTOR_BY_NAME = {
  "NVIDIA":"Semiconductors","TSMC":"Semiconductors","Broadcom":"Semiconductors","Micron Technology":"Semiconductors",
  "AMD":"Semiconductors","SK Hynix":"Semiconductors","ASML":"Semiconductors","Intel":"Semiconductors","CXMT":"Semiconductors",
  "Applied Materials":"Semiconductors","Lam Research":"Semiconductors","MediaTek":"Semiconductors","ASE Group":"Semiconductors",
  "United Microelectronics":"Semiconductors","Nanya Technology":"Semiconductors","Global Unichip Corp.":"Semiconductors",
  "Apple":"Hardware","Samsung":"Hardware","Cisco":"Hardware","Dell":"Hardware",
  "Delta Electronics":"Electronics/Hardware","Foxconn (Hon Hai Precision Industry)":"Electronics/Hardware",
  "Unimicron":"Electronics/Hardware","Quanta Computer":"Electronics/Hardware","Yageo":"Electronics/Hardware",
  "Wiwynn":"Electronics/Hardware","Accton Technology":"Electronics/Hardware",
  "Alphabet (Google)":"Software/Internet","Microsoft":"Software/Internet","Amazon":"Software/Internet",
  "Meta Platforms (Facebook)":"Software/Internet","Tencent":"Software/Internet","Palantir":"Software/Internet",
  "Oracle":"Software/Internet","Palo Alto Networks":"Software/Internet",
  "SpaceX":"Industrials/Auto/Aerospace","Tesla":"Industrials/Auto/Aerospace","Caterpillar":"Industrials/Auto/Aerospace",
  "General Electric":"Industrials/Auto/Aerospace",
  "Saudi Aramco":"Energy","Exxon Mobil":"Energy","Chevron":"Energy",
  "Berkshire Hathaway":"Financials","JPMorgan Chase":"Financials","Visa":"Financials","Mastercard":"Financials",
  "China Construction Bank":"Financials","Bank of America":"Financials","Agricultural Bank of China":"Financials",
  "ICBC":"Financials","HSBC":"Financials","Bank of China":"Financials","Fubon Financial":"Financials",
  "Cathay Financial Holding":"Financials","CTBC Financial Holding":"Financials","Taishin Financial Holdings":"Financials",
  "Eli Lilly":"Healthcare","Johnson & Johnson":"Healthcare","AbbVie":"Healthcare","Roche":"Healthcare","Merck":"Healthcare","UnitedHealth":"Healthcare",
  "Walmart":"Consumer/Retail","Costco":"Consumer/Retail","Coca-Cola":"Consumer/Retail","Procter & Gamble":"Consumer/Retail",
  "Nan Ya Plastics":"Materials/Energy","Formosa Petrochemical":"Materials/Energy","Chunghwa Telecom":"Telecom"
};

const ALIASES = {
  "Alphabet":"Alphabet (Google)",
  "Meta":"Meta Platforms (Facebook)",
  "Micron":"Micron Technology",
  "Foxconn":"Foxconn (Hon Hai Precision Industry)",
  "UMC":"United Microelectronics",
  "Cathay Financial":"Cathay Financial Holding",
  "CTBC Financial":"CTBC Financial Holding",
  "Global Unichip":"Global Unichip Corp.",
  "Taishin Financial":"Taishin Financial Holdings"
};

export function canonicalCompanyName(name) {
  return ALIASES[name] ?? name;
}

export function sectorForCompany(name) {
  return SECTOR_BY_NAME[canonicalCompanyName(name)] ?? "Other/Unclassified";
}
