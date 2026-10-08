import fs from "node:fs/promises";
import path from "node:path";
const root=process.cwd(),snapDir=path.join(root,"data/market/snapshots"),postRoot=path.join(root,"src/content/posts");
const dates=(await fs.readdir(snapDir)).filter(x=>/^\d{4}-\d{2}-\d{2}\.json$/.test(x)).map(x=>x.slice(0,10)).sort();
const snaps=new Map();
for(const date of dates) snaps.set(date,JSON.parse(await fs.readFile(path.join(snapDir,date+".json"),"utf8")));
const zh={US:"美國",AU:"澳洲",JP:"日本",DE:"德國",FR:"法國",GB:"英國",CN:"中國"};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const short=n=>n>=1e12?(n/1e12).toFixed(3)+"T":(n/1e9).toFixed(1)+"B";
const svg=(title,inner,h=520)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 '+h+'" role="img" aria-label="'+esc(title)+'"><rect width="1100" height="'+h+'" fill="white"/><text x="35" y="40" font-family="sans-serif" font-size="24" font-weight="700" fill="#111">'+esc(title)+'</text>'+inner+'</svg>';
const t=(x,y,s,size=15,color="#263238",anchor="start")=>'<text x="'+x+'" y="'+y+'" font-family="sans-serif" font-size="'+size+'" fill="'+color+'" text-anchor="'+anchor+'">'+esc(s)+'</text>';
const rect=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+Math.max(0,w).toFixed(2)+'" height="'+h+'" rx="3" fill="'+fill+'"/>';
const chartPath=(date,name)=>path.join(postRoot,"daily-capital-flows-"+date,name);
const rows=(s,key)=>s?.market_cap?.[key]?.rows??[];
const key=r=>r.ticker||r.name;
const idx=rs=>new Map(rs.map(r=>[key(r),r]));
function bars(date,now,old,kind){
 const top=now.slice(0,10),prior=idx(old),all=top.map(r=>({...r,prev:prior.get(key(r))?.market_cap_usd??null}));
 const max=Math.max(...all.map(r=>Math.max(r.market_cap_usd,r.prev??0)),1)*1.07;
 let inner=t(45,70,old.length?"藍：前期　橘：本期｜USD，按各期同口徑 Top 名單配對":"只有基準日快照：沒有前一天的可靠比較值",14);
 all.forEach((r,i)=>{let y=98+i*41;inner+=t(250,y+15,r.name,14,"#263238","end");const width=660;
 if(r.prev!=null)inner+=rect(265,y,width*r.prev/max,13,"#4f86bc");
 inner+=rect(265,y+14,width*r.market_cap_usd/max,13,"#ed9250");
 const delta=r.prev?((r.market_cap_usd/r.prev-1)*100):null;
 inner+=t(955,y+23,short(r.market_cap_usd)+(delta===null?"":"  "+(delta>0?"+":"")+delta.toFixed(2)+"%"),13);});
 return svg(kind+" Top 10 市值｜"+date,inner,545);
}
function shares(rs){const v={};let sum=0;for(const r of rs){const k=r.sector||"Unclassified";v[k]=(v[k]||0)+r.market_cap_usd;sum+=r.market_cap_usd;}return Object.fromEntries(Object.entries(v).map(([k,n])=>[k,100*n/sum]));}
function stacks(date,now,old,kind){
 const a=shares(now),b=shares(old),keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort((x,y)=>(a[y]||0)-(a[x]||0));
 const colors=["#2559ad","#ec9250","#44987e","#9b78bc","#ca6872","#8e9b39","#6691a3","#a08c79","#707070","#bea5bb","#aad0df"];
 let inner=t(45,75,old.length?"前期與本期產業市值占比（百分比）":"單一基準日，暫無跨日比較",15);
 const line=(distribution,y,label)=>{let p=250;inner+=t(225,y+28,label,16,"#263238","end");for(let i=0;i<keys.length;i++){const w=750*(distribution[keys[i]]||0)/100;inner+=rect(p,y,w,38,colors[i%colors.length]);p+=w;}};
 if(old.length)line(b,120,"前期");line(a,old.length?205:135,"本期");
 let start=old.length?290:225;
 keys.forEach((k,i)=>{const y=start+i*26;const oldPct=(b[k]??0),newPct=(a[k]??0),diff=newPct-oldPct;inner+=rect(55,y-12,15,15,colors[i%colors.length])+t(82,y,k,14)+t(830,y,oldPct.toFixed(2)+"% → "+newPct.toFixed(2)+"%"+(old.length?" ("+(diff>=0?"+":"")+diff.toFixed(2)+" pp)":"")+"",13);});
 return svg(kind+" Top 產業占比變化｜"+date,inner,Math.max(460,start+keys.length*26+25));
}
function yields(date){
 const ds=dates.filter(d=>d<=date).slice(-8),countries=["US","AU","JP","DE","FR","GB","CN"];
 const all=countries.flatMap(c=>ds.map(d=>snaps.get(d).sovereign_10y?.[c]?.yield_pct).filter(Number.isFinite));
 const min=Math.floor((Math.min(...all)-.2)*2)/2,max=Math.ceil((Math.max(...all)+.2)*2)/2;
 const colors=["#1e63b6","#e07728","#39866e","#8462b3","#bb4b59","#8f8529","#888"];
 let inner=t(80,74,"各國按交易日記錄；缺資料不中斷為 0；圖例列末次讀數",14);
 for(let i=0;i<=4;i++){const y=110+i*90;inner+='<line x1="125" y1="'+y+'" x2="860" y2="'+y+'" stroke="#ddd"/>'+t(110,y+4,(max-(max-min)*i/4).toFixed(2)+"%",12,"#555","end");}
 ds.forEach((d,i)=>inner+=t(125+i*735/Math.max(ds.length-1,1),493,d.slice(5),13,"#555","middle"));
 countries.forEach((c,j)=>{
  const pts=ds.map((d,i)=>{const v=snaps.get(d).sovereign_10y?.[c]?.yield_pct;return typeof v==="number"?[125+i*735/Math.max(ds.length-1,1),110+(max-v)/(max-min)*360,v,d]:null;}).filter(Boolean);
  if(pts.length>1)inner+='<polyline fill="none" stroke="'+colors[j]+'" stroke-width="3" points="'+pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ")+'"/>';
  for(const p of pts)inner+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="'+colors[j]+'"/>';
  const last=pts.at(-1),fresh=last&&snaps.get(last[3]).sovereign_10y[c].source_date;
  inner+=rect(885,102+j*47,12,12,colors[j])+t(906,114+j*47,zh[c]+" "+(last?last[2].toFixed(3)+"%":"—")+(fresh&&fresh!==last[3]?"*":""),15);
 });
 inner+=t(55,535,"* 星號表示該觀測點源自較早的實際交易日；假日值不代表新交易。",12);
 return svg("主要國家 10 年期公債殖利率趨勢｜截至 "+date,inner,560);
}
function totals(date,s,prior){
 const groups=[["全球 Top 50","global_top50"],["台灣 Top 20","taiwan_top20"]];
 let inner=t(55,78,"相同資料來源、不同日期 Top 名單總值；名單變更可能影響可比性；市值變化不是現金淨流入",14);
 groups.forEach(([label,k],i)=>{const a=rows(s,k),b=rows(prior,k),now=a.reduce((x,r)=>x+r.market_cap_usd,0),old=b.reduce((x,r)=>x+r.market_cap_usd,0),y=135+i*150;
 inner+=t(55,y,label,19); if(old){const delta=(now/old-1)*100,scale=Math.max(now,old)*1.05;inner+=t(55,y+38,"前期 "+short(old),14)+rect(270,y+22,630*old/scale,18,"#4f86bc");inner+=t(55,y+76,"本期 "+short(now),14)+rect(270,y+60,630*now/scale,18,"#ed9250");inner+=t(55,y+108,"變化 "+(delta>=0?"+":"")+delta.toFixed(3)+"%｜"+short(now-old),16);}else inner+=t(55,y+54,"僅有本日 "+short(now)+"；歷史不足，未計算變化",16);});
 return svg("大型企業總市值跨日比較｜"+date,inner,500);
}
for(const date of (process.argv.slice(2).length?process.argv.slice(2):dates.slice(-1))){
 const s=snaps.get(date);if(!s?.market_cap)continue;
 const prev=dates.filter(d=>d<date&&snaps.get(d)?.market_cap).at(-1),p=snaps.get(prev);
 const folder=path.join(postRoot,"daily-capital-flows-"+date);
 try{await fs.access(path.join(folder,"index.md"));}catch{continue;}
 const outputs={
 "trend-global-top10.svg":bars(date,rows(s,"global_top50"),rows(p,"global_top50"),"全球"),
 "trend-taiwan-top10.svg":bars(date,rows(s,"taiwan_top20"),rows(p,"taiwan_top20"),"台灣"),
 "trend-global-sectors.svg":stacks(date,rows(s,"global_top50"),rows(p,"global_top50"),"全球"),
 "trend-taiwan-sectors.svg":stacks(date,rows(s,"taiwan_top20"),rows(p,"taiwan_top20"),"台灣"),
 "trend-sovereign-10y.svg":yields(date),
 "trend-marketcap-totals.svg":totals(date,s,p)
 };
 for(const [name,content] of Object.entries(outputs))await fs.writeFile(chartPath(date,name),content);
 let md=await fs.readFile(path.join(folder,"index.md"),"utf8");
 const targets=["global-top10-marketcap","global-top50-sector-share","taiwan-top10-marketcap","taiwan-top20-sector-share","sovereign-10y"];
 const names=["trend-global-top10.svg","trend-global-sectors.svg","trend-taiwan-top10.svg","trend-taiwan-sectors.svg","trend-sovereign-10y.svg"];
 for(let i=0;i<targets.length;i++){
  const re=new RegExp("(!\\[[^\\]]*\\]\\()\\./"+targets[i]+"[^)]*\\.svg(\\))","g");
  md=md.replace(re,"$1./"+names[i]+"$2");
 }
 const marker="<!-- trend-totals -->";
 if(!md.includes(marker))md=md.replace("## 資料",marker+"\n\n## 全球與台灣總市值變化圖\n\n![全球與台灣總市值跨日比較](./trend-marketcap-totals.svg)\n\n> 市值差額是估值變化，不等於真實資金淨流入。\n\n## 資料");
 await fs.writeFile(path.join(folder,"index.md"),md);
 console.log(date+" generated "+Object.keys(outputs).length+" trend charts; prior="+(prev||"none"));
}
