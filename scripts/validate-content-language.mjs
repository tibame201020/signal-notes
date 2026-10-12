import fs from 'node:fs';
import path from 'node:path';
import { COMPANY_NAME_ZH, SECTOR_NAME_ZH } from './market-data/display-zh.mjs';

const root = process.cwd();
const postsDir = path.join(root, 'src/content/posts');
const failures = [];
const since = '2026-10-10';
const dirs = fs.readdirSync(postsDir).filter(n =>
  /^(?:daily-(?:world|finance|ai|semiconductor|software|capital-flows)|investment-(?:companies|skills))-\d{4}-\d{2}-\d{2}$/.test(n) &&
  n.slice(-10) >= since
);
const field = (yaml, name) => yaml.match(new RegExp('^' + name + ':\\s*"?([^"\\n]+)"?', 'm'))?.[1]?.trim() ?? '';
for (const dir of dirs) {
  const file = path.join(postsDir, dir, 'index.md');
  if (!fs.existsSync(file)) {failures.push(dir + ': 缺文章'); continue;}
  const raw = fs.readFileSync(file, 'utf8');
  const parts = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!parts) {failures.push(dir + ': 缺 YAML frontmatter'); continue;}
  const [, yaml, body] = parts;
  const title = field(yaml, 'title');
  const description = field(yaml, 'description');
  const categoryName = yaml.match(/^category:\r?\n\s+name:\s*"([^"]+)"/m)?.[1] ?? '';
  const categorySlug = yaml.match(/^category:\r?\n\s+name:.*\r?\n\s+slug:\s*"([^"]+)"/m)?.[1] ?? '';
  if (!/[\u3400-\u9fff]/u.test(title) || /\b(?:Investment Outlook|Software)\b/u.test(title))
    failures.push(dir + ': 題名應使用繁體中文主標');
  if ((description.match(/[\u3400-\u9fff]/gu) ?? []).length < 12)
    failures.push(dir + ': 摘要缺少足夠中文敘述');
  if (dir.startsWith('investment-') && (categoryName !== '投資布局' || categorySlug !== 'investment-outlook'))
    failures.push(dir + ': 投資文章必須使用顯示名稱「投資布局」，保留原 slug');
  if (dir.startsWith('daily-software-') && !/^\s+- name: "軟體工程"\s*$/m.test(yaml))
    failures.push(dir + ': 軟體工程標籤的顯示名稱應為中文，保留 software slug');
  const prose = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '')
    .replace(/https?:\/\/[^\s)>]+/g, '')
    .replace(/<[^>]*>/g, '');
  const forbidden = prose.match(/\b(?:Investment Outlook|Software|repo|snapshot|dashboard|schema|fallback|async|trace|forward)\b/gi) ?? [];
  if (forbidden.length) failures.push(dir + ': 存在未中文化的編輯用語：' + [...new Set(forbidden)].join(', '));
  const han = (prose.match(/[\u3400-\u9fff]/gu) ?? []).length;
  const englishWords = (prose.match(/[A-Za-z]+/g) ?? []).length;
  if (!han || englishWords / (han + englishWords) > 0.13)
    failures.push(dir + ': 英文在正文中的比例過高；品牌、引用及程式碼除外，需人工校稿');
}

// 金流文章的圖片和下載表格也是讀者介面，不可只檢查 Markdown。
const englishSectors = Object.keys(SECTOR_NAME_ZH);
const englishCompanies = Object.keys(COMPANY_NAME_ZH);
const textOfSvg = svg => [...svg.matchAll(/<text\\b[^>]*>([\\s\\S]*?)<\\/text>/g)]
  .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
const moneyDirs = fs.readdirSync(postsDir).filter(n =>
  /^daily-capital-flows-\\d{4}-\\d{2}-\\d{2}$/.test(n) && n.slice(-10) >= '2026-10-07'
);
for (const dir of moneyDirs) {
  const folder = path.join(postsDir, dir);
  const body = fs.readFileSync(path.join(folder, 'index.md'), 'utf8');
  const images = [...body.matchAll(/!\\[[^\\]]*\\]\\(\\.\\/([^)]*\\.svg)\\)/g)].map(m => m[1]);
  const csvs = [...body.matchAll(/\\]\\(\\.\\/([^)]*\\.csv)\\)/g)].map(m => m[1]);
  if (images.length < 5) failures.push(dir + ': 需要至少五張有效圖表');
  if (csvs.length < 2) failures.push(dir + ': 缺少全球／台灣 CSV');
  for (const file of images) {
    const full = path.join(folder, file);
    if (!fs.existsSync(full)) { failures.push(dir + ': 圖表不存在：' + file); continue; }
    const svg = fs.readFileSync(full, 'utf8');
    const labels = textOfSvg(svg);
    const englishSectorsFound = englishSectors.filter(code =>
      labels.some(label => label === code || label.includes(code + ' ')) ||
      svg.includes('aria-label="' + code + '"')
    );
    const englishCompaniesFound = englishCompanies.filter(name =>
      COMPANY_NAME_ZH[name] !== name && labels.some(label =>
        label === name || (label.endsWith('…') && name.startsWith(label.slice(0, -1)) && label.length > 12)
      )
    );
    if (englishSectorsFound.length) failures.push(dir + '/' + file + ': 產業圖例未中文化：' + englishSectorsFound.join(', '));
    if (englishCompaniesFound.length) failures.push(dir + '/' + file + ': 公司名稱未中文化：' + englishCompaniesFound.join(', '));
    if (labels.some(label => /\\bTop(?:\\s*(?:10|20|50))?\\b|\\bUSD\\b|\\bpp\\b/.test(label)))
      failures.push(dir + '/' + file + ': 圖中文字保留英文單位／排名');
  }
  for (const file of csvs) {
    const full = path.join(folder, file);
    if (!fs.existsSync(full)) { failures.push(dir + ': CSV 不存在：' + file); continue; }
    const csv = fs.readFileSync(full, 'utf8').replace(/^\\uFEFF/, '');
    if (!csv.startsWith('"排名","公司名稱","產業分類","市值（美元）",'))
      failures.push(dir + '/' + file + ': 中文主欄位應置於英文來源欄位之前');
    const firstData = csv.split(/\\r?\\n/)[1] ?? '';
    if (!/^"\\d+","[^"]*[\\u3400-\\u9fff]/u.test(firstData))
      failures.push(dir + '/' + file + ': 首筆公司顯示名稱缺少中文');
  }
}

if (failures.length) {
  console.error('繁體中文語言檢查未通過：\n' + failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: ' + dirs.length + ' 篇近期每日文章及 ' + moneyDirs.length + ' 篇金流文章的圖表／CSV 以繁體中文顯示。');
}
