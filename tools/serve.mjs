import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const project=fileURLToPath(new URL('../',import.meta.url));
const root=path.resolve(project,process.argv.includes('--dist')?'dist':'.');
const port=Number(process.env.HOMEPAGE_PREVIEW_PORT||4179);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';
    if(name.split('/').some(part=>part.startsWith('.')&&part!=='.nojekyll')){res.writeHead(404);res.end();return;}
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let body,info;
    try{info=await stat(file);if(!info.isFile())throw new Error();body=await readFile(file);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')));return;}
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416);res.end();return;}const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),info.size-1):info.size-1;if(start>end||start>=info.size){res.writeHead(416);res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:body.subarray(start,end+1));}
    else{res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);}
  }catch(error){res.writeHead(500);res.end('Preview error');}
}).listen(port,'127.0.0.1',()=>console.log(`Wenzhan Li homepage preview: http://127.0.0.1:${port}`));
