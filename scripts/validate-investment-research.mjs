import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), posts='src/content/posts', failures=[];
const has=f=>fs.existsSync(path.join(root,f));
const article=slug=>posts+'/'+slug+'/index.md';
const subjects=['world','finance','ai','semiconductor','software','capital-flows'];
const nonempty=v=>typeof v==='string'&&v.trim().length>0;
const issue=(d,message)=>failures.push(d+': '+message);
const editions=[...new Set(fs.readdirSync(posts).filter(n=>/^investment-(companies|skills)-\d{4}-\d{2}-\d{2}$/.test(n)).map(n=>n.slice(-10)).filter(d=>d>='2026-10-07'))].sort();
for(const d of editions){
  const companies=article('investment-companies-'+d),skills=article('investment-skills-'+d);
  if(!has(companies)||!has(skills)){issue(d,'both investment articles required');continue;}
  const filename='data/investment/screenings/'+d+'.json';
  if(!has(filename)){issue(d,'screening evidence manifest required');continue;}
  let doc;
  try{doc=JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));}catch(e){issue(d,'invalid JSON: '+e.message);continue;}
  if(doc.date!==d||!['company','industry'].includes(doc.selectionMode))issue(d,'invalid date or selectionMode');
  const expected=subjects.map(s=>'daily-'+s+'-'+d);
  if(!Array.isArray(doc.sourcePosts)||expected.some(s=>!doc.sourcePosts.includes(s)))issue(d,'not all six daily subjects in input list');
  for(const s of expected)if(!has(article(s)))issue(d,'missing daily article '+s);
  if(!Array.isArray(doc.beliefPosts)||!doc.beliefPosts.length||doc.beliefPosts.some(s=>!nonempty(s)||!has(article(s))))issue(d,'beliefPosts must point to actual published posts');
  if(!Array.isArray(doc.signals)||doc.signals.length<2)issue(d,'need at least two traceable frontier signals');
  const ids=new Set(), group=new Set();
  for(const s of doc.signals||[]){
    if(!nonempty(s.id)||ids.has(s.id))issue(d,'missing or duplicate signal id');ids.add(s.id);
    if(!expected.includes(s.post)||!nonempty(s.claim)||!Array.isArray(s.sourceUrls)||s.sourceUrls.length===0||s.sourceUrls.some(url=>!/^https?:\/\/[^ ]+$/.test(url)))issue(d,'invalid source provenance');
    if(expected.includes(s.post))group.add(s.post);
  }
  if(group.size<2)issue(d,'signals only from one frontier; need at least two');
  const companiesSeen=new Set(),layers=new Set();let selected=0;
  if(!Array.isArray(doc.candidates)||doc.candidates.length<2)issue(d,'no comparative candidate pool');
  for(const c of doc.candidates||[]){
    if(!nonempty(c.id)||companiesSeen.has(c.id))issue(d,'missing or duplicate candidate id');companiesSeen.add(c.id);
    for(const k of ['company','ticker','market','valueLayer','reason'])if(!nonempty(c[k]))issue(d,'candidate missing '+k);
    if(nonempty(c.valueLayer))layers.add(c.valueLayer);
    if(!['selected','watch','rejected'].includes(c.disposition))issue(d,'bad candidate disposition');
    if(c.disposition==='selected')selected++;
    if(!Array.isArray(c.signalIds)||!c.signalIds.length||c.signalIds.some(id=>!ids.has(id)))issue(d,'candidate has no published evidence');
    if(c.valuation){
      const v=c.valuation;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(v.marketAsOf)||!nonempty(v.method)||!nonempty(v.currency)||!Number.isFinite(v.anchorPrice)||v.anchorPrice<=0||!['bear','base','bull'].every(k=>Number.isFinite(v[k])&&v[k]>=0))issue(d,'incomplete market valuation');
    }else if(!nonempty(c.missingValuationReason))issue(d,'no valuation or missing-data reason');
    if(doc.selectionMode==='company'&&c.disposition==='selected'&&!c.valuation)issue(d,'selected company has no price-based valuation');
  }
  if(doc.selectionMode==='company'){
    if(selected<1||selected>2)issue(d,'select one or two companies');
    if(doc.candidates.length<4&&!nonempty(doc.limitedPoolReason))issue(d,'small candidate pool lacks reason');
    if(layers.size<2&&!nonempty(doc.limitedPoolReason))issue(d,'single value-chain layer lacks reason');
  }else{
    if(!nonempty(doc.industryReason)||!Array.isArray(doc.watchCompanies)||doc.watchCompanies.length>2)issue(d,'industry fallback incomplete');
  }
  if(!Array.isArray(doc.rankedIds)||doc.rankedIds.length!==companiesSeen.size||new Set(doc.rankedIds).size!==companiesSeen.size||doc.rankedIds.some(id=>!companiesSeen.has(id)))issue(d,'candidate ranking missing');
  const md=fs.readFileSync(path.join(root,companies),'utf8');
  for(const key of ['候選池與淘汰理由','市場估值與我的估值','推論與選擇'])if(!md.includes(key))issue(d,'article lacks section '+key);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('PASS: investment provenance structure ('+editions.length+' editions checked from 2026-10-07).');
