import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const validator=fileURLToPath(new URL('./validate-investment-research.mjs',import.meta.url));
const d='2026-10-09';
const topics=['world','finance','ai','semiconductor','software','capital-flows'];
function setup(){
 const root=mkdtempSync(path.join(tmpdir(),'investment-provenance-'));
 function save(rel,content='---\n---\n'){const dest=path.join(root,rel);mkdirSync(path.dirname(dest),{recursive:true});writeFileSync(dest,content);}
 const daily=topics.map(t=>'daily-'+t+'-'+d);
 for(const slug of [...daily,'investment-companies-'+d,'investment-skills-'+d,'published-belief'])save('src/content/posts/'+slug+'/index.md',slug.startsWith('investment-companies')?'# 候選池與淘汰理由\n# 市場估值與我的估值\n# 推論與選擇\n':undefined);
 const doc={date:d,selectionMode:'company',sourcePosts:daily,beliefPosts:['published-belief'],
   signals:[{id:'sig1',post:daily[0],claim:'Independent world signal',sourceUrls:['https://example.org/world']},{id:'sig2',post:daily[3],claim:'Independent manufacturing signal',sourceUrls:['https://example.org/industry']}],
   candidates:[
    {id:'alpha',company:'Alpha',ticker:'A',market:'TW',valueLayer:'Compute',signalIds:['sig2'],disposition:'selected',reason:'Attractive valuation',valuation:{marketAsOf:d,method:'P/E',anchorPrice:100,currency:'TWD',bear:70,base:120,bull:150}},
    {id:'bravo',company:'Bravo',ticker:'B',market:'TW',valueLayer:'Services',signalIds:['sig1'],disposition:'watch',reason:'Already expensive',missingValuationReason:'Current price not confirmed'},
    {id:'charlie',company:'Charlie',ticker:'C',market:'TW',valueLayer:'Compute',signalIds:['sig2'],disposition:'rejected',reason:'No margin capture',missingValuationReason:'No reliable price'},
    {id:'delta',company:'Delta',ticker:'D',market:'TW',valueLayer:'Services',signalIds:['sig1'],disposition:'rejected',reason:'Low incremental returns',missingValuationReason:'Data not available'}
   ],
   rankedIds:['alpha','bravo','delta','charlie']};
 const manifest='data/investment/screenings/'+d+'.json';
 save(manifest,JSON.stringify(doc,null,2));
 return {root,doc,manifest,save};
}
function run(root){return spawnSync(process.execPath,[validator],{cwd:root,encoding:'utf8'});}
test('passes evidence-led selection across independent signals',()=>{
 const f=setup();try{const r=run(f.root);assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/PASS/);}finally{rmSync(f.root,{recursive:true,force:true});}
});
test('rejects single-frontier anchoring',()=>{
 const f=setup();try{f.doc.signals[1].post=f.doc.signals[0].post;f.save(f.manifest,JSON.stringify(f.doc));const r=run(f.root);assert.notEqual(r.status,0);assert.match(r.stderr,/at least two/);}finally{rmSync(f.root,{recursive:true,force:true});}
});
test('rejects missing screening manifest',()=>{
 const f=setup();try{rmSync(path.join(f.root,f.manifest));const r=run(f.root);assert.notEqual(r.status,0);assert.match(r.stderr,/manifest required/);}finally{rmSync(f.root,{recursive:true,force:true});}
});
