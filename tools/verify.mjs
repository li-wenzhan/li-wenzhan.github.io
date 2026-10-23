import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const data=JSON.parse(await read('_data/profile.json'));
const translated=JSON.parse(await read('_data/profile.zh.json'));
const honors=JSON.parse(await read('_data/honors.json'));
const css=await read('assets/css/global.css'),js=await read('assets/js/main.js');
const pages=['index.html','publications/index.html','experience/index.html','research/index.html','zh/index.html','zh/publications/index.html','zh/experience/index.html','zh/research/index.html'];
const errors=[];
const fail=message=>errors.push(message);
new Script(js,{filename:'main.js'});
const cache=new Map(await Promise.all(pages.map(async p=>[p,await read(p)])));
let resources=0;
for(const [page,code] of cache){
  const pageIds=[...code.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(pageIds).size!==pageIds.length)fail(`Duplicate IDs in ${page}`);
  if((code.match(/<h1\b/g)||[]).length!==1)fail(`Expected one main heading in ${page}`);
  if((code.match(/aria-current="page"/g)||[]).length!==1)fail(`Missing active page in ${page}`);
  const canonical=data.url+page.replace(/index\.html$/,'');
  if(!code.includes(`<link rel="canonical" href="${canonical}">`))fail(`Incorrect canonical in ${page}`);
  const alternate=page.startsWith('zh/')?page.slice(3):'zh/'+page;
  if(!code.includes(`data-base="/${alternate.replace(/index\.html$/,'')}"`))fail(`Incorrect language switch in ${page}`);
  const expectedLang=page.startsWith('zh/')?'zh-CN':'en';
  if(!code.includes(`<html lang="${expectedLang}">`))fail(`Incorrect language in ${page}`);
  const refs=[...code.matchAll(/(?:href|src|poster)="([^"]+)"/g)].map(m=>m[1]);
  for(const reference of new Set(refs)){
    if(/^(?:https?:|mailto:)/.test(reference))continue;
    const [url,fragment]=reference.split('#');
    if(!url){if(fragment&&!pageIds.includes(fragment))fail(`Missing anchor in ${page}: ${reference}`);continue;}
    let target=path.resolve(root,url.startsWith('/')?url.slice(1):path.join(path.dirname(page),url.split('?')[0]));
    if(target!==path.resolve(root)&&!target.startsWith(path.resolve(root)+path.sep)){fail(`Unsafe path: ${reference}`);continue;}
    try{
      let info=await stat(target);
      if(info.isDirectory()){target=path.join(target,'index.html');info=await stat(target);}
      if(!info.isFile())fail(`Resource is not a file: ${reference}`);
      if(fragment&&target.endsWith('.html')){
        const targetHtml=await readFile(target,'utf8');
        if(!targetHtml.includes(`id="${fragment}"`))fail(`Missing destination anchor: ${reference}`);
      }
      resources++;
    }catch{fail(`Missing resource in ${page}: ${reference}`);}
  }
  for(const tag of code.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]*"/.test(tag[0]))fail(`Missing image alternative in ${page}`);
  if(/Your Name|your@email|PLACEHOLDER|lorem ipsum/.test(code))fail(`Placeholder in ${page}`);
}
for(const page of ['index.html','zh/index.html']){
  const html=cache.get(page);
  const dates=[...html.matchAll(/<time datetime="([^"]+)"/g)].map(m=>m[1]);
  if(dates.length!==data.news.length||dates.some((d,i)=>i&&dates[i-1]<d))fail(`News is incomplete or out of order in ${page}`);
  if(!html.includes('tabindex="0" role="region"'))fail('News must support keyboard scrolling');
}
for(const d of [data,translated]){
  if(d.news.find(n=>n.id==='phd')?.date!=='2026-08'||d.news.find(n=>n.id==='corl')?.date!=='2026-09')fail('Author-corrected News dates changed');
  if(d.news.find(n=>n.id==='ra-start')?.date!=='2025-08'||d.news.some(n=>n.id==='ra-end'))fail('RA News must match the author instructions');
}
if(JSON.stringify(data.news.map(n=>[n.id,n.date]))!==JSON.stringify(translated.news.map(n=>[n.id,n.date])))fail('Bilingual News chronology differs');
if(data.education[0].dates!=='Aug 2026 — Present')fail('PhD start is inconsistent with corrected News');
if(data.appointment.dates!=='Aug 2025 — Apr 2026')fail('RA appointment interval changed');
for(const [locale,items] of Object.entries(honors)){
  if(!Array.isArray(items))fail(`Invalid honors list for ${locale}`);
  for(const h of items)if(!h.year||!h.title||!h.organization||h.url&&!/^https:\/\//.test(h.url))fail(`Incomplete honor in ${locale}`);
  const html=cache.get(locale==='zh'?'zh/experience/index.html':'experience/index.html');
  if(Boolean(items.length)!==html.includes('id="honors"'))fail(`Empty honors section visible in ${locale}`);
}
if(honors.en.length!==honors.zh.length)fail('Honors translations must stay synchronized');
for(const [,url] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  try{await stat(path.resolve(root,'assets/css',url));}catch{fail(`Missing CSS resource: ${url}`);}
}
for(const name of ['manrope.woff2','newsreader.woff2','newsreader-italic.woff2','ibm-plex-mono.woff2','noto-sans-sc.woff2','noto-serif-sc.woff2']){
  const font=await readFile(path.join(root,'assets/fonts',name));if(font.subarray(0,4).toString()!=='wOF2')fail(`Invalid font: ${name}`);
}
const pubs=data.publications;
if(pubs.length!==4||pubs.filter(p=>p.status==='Accepted'&&p.venue==='CoRL 2026').length!==3)fail('Publication status audit failed');
const dada=pubs.find(p=>p.id==='dada');
if(dada?.workshop?.date!=='2026-04-11'||!dada.workshop.note.includes('extended abstract'))fail('DADA workshop provenance missing');
for(const page of ['publications/index.html','zh/publications/index.html']){
  const code=cache.get(page);
  if((code.match(/data-category=/g)||[]).length!==4||!code.includes('WPBP @ ICRA 2026'))fail('Workshop must remain attached to DADA');
}
if(pubs.find(p=>p.id==='merl')?.project!=='https://merl-project.github.io/')fail('Wrong canonical MERL domain');
for(const pub of pubs){
  if(!pub.authors.includes(data.name))fail(`Missing author in ${pub.id}`);
  if(pub.equalAuthors.some(author=>!pub.authors.includes(author)))fail(`Invalid equal-contribution marker: ${pub.id}`);
  const pdf=await readFile(path.join(root,pub.pdf));if(pdf.subarray(0,5).toString()!=='%PDF-')fail(`Invalid PDF: ${pub.id}`);
}
if(!css.includes('prefers-reduced-motion')||!cache.get('index.html').includes('Skip to content'))fail('Accessibility fallback missing');
if(cache.get('index.html').includes('Learning to <em>imagine.'))fail('Promotional hero restored');
if(errors.length)throw new Error(errors.join('\n'));
console.log(`Verified ${pages.length} pages, ${resources} local references, sorted bilingual News, preserved dates, conditional honors, and four sourced publications.`);
