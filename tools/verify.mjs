import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const data=JSON.parse(await read('_data/profile.json'));
const html=await read('index.html'),css=await read('assets/css/global.css'),js=await read('assets/js/main.js');
const errors=[];
new Script(js,{filename:'main.js'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)errors.push('Duplicate HTML IDs');
if(data.url!=='https://li-wenzhan.github.io/')errors.push('Incorrect personal homepage URL');
let resources=0;
for(const page of ['index.html','zh/index.html']){
  const code=await read(page);
  const pageIds=[...code.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  if(new Set(pageIds).size!==pageIds.length)errors.push(`Duplicate IDs in ${page}`);
  const refs=[...code.matchAll(/(?:href|src|poster)="([^"]+)"/g)].map(m=>m[1]);
  for(const reference of new Set(refs)){
    if(reference.startsWith('#')){if(!pageIds.includes(reference.slice(1)))errors.push(`Missing anchor ${reference}`);continue;}
    if(/^(?:https?:|mailto:)/.test(reference))continue;
    let target=path.resolve(root,path.dirname(page),reference.split(/[?#]/)[0]);
    if(target!==path.resolve(root)&&!target.startsWith(path.resolve(root)+path.sep)){errors.push(`Unsafe asset path: ${reference}`);continue;}
    try{let info=await stat(target);if(info.isDirectory()){target=path.join(target,'index.html');info=await stat(target);}if(!info.isFile())errors.push(`Resource is not a file: ${reference}`);resources++;}catch{errors.push(`Missing resource in ${page}: ${reference}`);}
  }
}
const zh=await read('zh/index.html');
if(!html.includes('<html lang="en">')||!zh.includes('<html lang="zh-CN">'))errors.push('Incorrect page language');
if(!zh.includes('我的贡献')||!zh.includes('世界—动作模型')||zh.includes('https://li-wenzhan.github.io/zh/assets/'))errors.push('Chinese localization is incomplete');
for(const [,url] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  try{await stat(path.resolve(root,'assets/css',url));}catch{errors.push(`Missing CSS resource: ${url}`);}
}
for(const tag of html.matchAll(/<img\b[^>]*>/g))if(!/\balt="[^"]*"/.test(tag[0]))errors.push('An image is missing alternative text');
for(const name of ['manrope.woff2','newsreader.woff2','newsreader-italic.woff2','ibm-plex-mono.woff2','noto-sans-sc.woff2','noto-serif-sc.woff2']){
  const font=await readFile(path.join(root,'assets/fonts',name));if(font.subarray(0,4).toString()!=='wOF2')errors.push(`Invalid WOFF2 font: ${name}`);
}
const pubs=data.publications;
if(pubs.length!==4||pubs.filter(p=>p.status==='Accepted'&&p.venue==='CoRL 2026').length!==3)errors.push('Publication status/source audit failed');
if(pubs.find(p=>p.id==='merl')?.project!=='https://merl-project.github.io/')errors.push('MERL must use its canonical project domain');
for(const pub of pubs){
  if(!pub.authors.includes(data.name))errors.push(`Missing owner in ${pub.id} author list`);
  if(pub.equalAuthors.some(author=>!pub.authors.includes(author)))errors.push(`Invalid equal-contribution marker: ${pub.id}`);
  const pdf=await readFile(path.join(root,pub.pdf));if(pdf.subarray(0,5).toString()!=='%PDF-')errors.push(`Invalid paper: ${pub.id}`);
}
if(/Your Name|your@email|PLACEHOLDER|lorem ipsum/.test(html+JSON.stringify(data)))errors.push('Template placeholder found');
if(!css.includes('prefers-reduced-motion')||!html.includes('Skip to content'))errors.push('Accessibility fallback missing');
if(/@media\s+print\)/.test(css))errors.push('Malformed print stylesheet');
if(!html.includes('https://merl-project.github.io/')||html.includes('https://li-wenzhan.github.io/MERL-project/'))errors.push('Outdated MERL link');
if(errors.length)throw new Error(errors.join('\n'));
console.log(`Verified ${resources} local resources, ${ids.length} unique IDs, four sourced publications, font files, JavaScript syntax, and publication metadata.`);
