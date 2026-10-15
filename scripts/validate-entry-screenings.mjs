import fs from 'node:fs';
import path from 'node:path';
export const average = xs => xs.reduce((a,b)=>a+b,0)/xs.length;
export function checkScreening(s){
 const e=[];const err=m=>e.push(m);
 if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(s.date||'')||!s.cutoffAt)err('日期／截稿缺漏');
 if(s.liquidityRule?.minPreviousTurnoverTwd!==100000000||s.liquidityRule?.minAverage20DayTurnoverTwd!==100000000)err('成交額門檻不同');
 if(!Array.isArray(s.candidates)||!s.candidates.length)err('候選缺漏');
 const seen=new Set();
 for(const c of s.candidates||[]){
  if(!c.id||seen.has(c.id))err('候選識別重複');seen.add(c.id);
  if(!c.previous?.date||!/^https:\/\//.test(c.sourceUrls?.[0]||''))err(c.id+' 行情日期或來源缺漏');
  if(c.disposition!=='formal-watch')continue;
  const x=c.turnover20,y=c.close20,a=c.atr14,b=c.entryBandTwd;
  if(!x||x.dates?.length!==20||x.turnoverTwd?.length!==20||x.dates.at(-1)!==c.previous.date||!x.turnoverTwd.every(n=>Number.isFinite(n)&&n>0)||Math.abs(average(x.turnoverTwd)-x.averageTwd)>1)err(c.id+' 二十日成交額不可重算');
  if(c.previous.turnoverTwd<1e8||x?.averageTwd<1e8)err(c.id+' 流動性未達門檻');
  if(!y||y.valuesTwd?.length!==20||Math.abs(average(y.valuesTwd)-y.averageTwd)>0.01)err(c.id+' 二十日均價不可重算');
  if(!a||a.valuesTwd?.length!==14||Math.abs(average(a.valuesTwd)-a.twd)>0.01)err(c.id+' 十四期波幅不可重算');
  if(!b||!(b.low>0&&b.high>=b.low&&b.high<=c.previous.closeTwd)||Math.abs((c.previous.closeTwd-b.high)/c.previous.closeTwd*100-b.discountPctLow)>0.01||Math.abs((c.previous.closeTwd-b.low)/c.previous.closeTwd*100-b.discountPctHigh)>0.01)err(c.id+' 買入區間不可重算');
 }
 if(JSON.stringify((s.qualifiedIds||[]).slice().sort())!==JSON.stringify((s.candidates||[]).filter(c=>c.disposition==='formal-watch').map(c=>c.id).sort()))err('正式候選識別不一致');
 return e;
}
const direct=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(new URL(import.meta.url).pathname);
if(direct){
 const root=process.cwd(),base='data/investment/entry-screenings',dir='src/content/posts',fail=[];
 for(const name of fs.readdirSync(dir).filter(n=>/^daily-stock-prices-\\d{4}-\\d{2}-\\d{2}$/.test(n))){const d=name.slice(-10),f=path.join(base,d+'.json');if(!fs.existsSync(f)){fail.push(d+' 缺研究資料');continue;}const s=JSON.parse(fs.readFileSync(f,'utf8'));fail.push(...checkScreening(s).map(e=>d+': '+e));const md=fs.readFileSync(path.join(dir,name,'index.md'),'utf8');if(s.date!==d||!md.includes('slug: "daily-stock-prices-'+d+'"'))fail.push(d+' 文章／研究日期不符');}
 if(fail.length){console.error(fail.join('\\n'));process.exitCode=1;}else console.log('PASS: 台股買入價研究資料與價位計算可重算。');
}
