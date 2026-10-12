import fs from 'node:fs';
import path from 'node:path';

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
if (failures.length) {
  console.error('繁體中文語言檢查未通過：\n' + failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: ' + dirs.length + ' 篇近期每日文章以繁體中文為主要敘述語言。');
}
