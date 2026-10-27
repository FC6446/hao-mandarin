import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { securityHeaders, publicAssets } from './security.js';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=new Set(publicAssets);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
export function createAppServer() {
  const server=http.createServer({maxHeaderSize:8192},async(req,res)=>{
    for (const [name,value] of Object.entries(securityHeaders)) res.setHeader(name,value);
    res.setHeader('Cache-Control','no-store');
    const end=(status,message)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(req.method==='HEAD'?undefined:message);};
    if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');req.resume();end(405,'Method not allowed');return;}
    let pathname;
    try { pathname=decodeURIComponent((req.url||'').split('?')[0]); }
    catch { end(400,'Invalid request');return; }
    // Match the raw decoded path before any URL normalisation. No directory access.
    const file=pathname==='/'?'index.html':pathname.slice(1);
    if(!pathname.startsWith('/') || !allowed.has(file)){end(404,'Not found');return;}
    try {
      const content=await readFile(path.join(root,file));
      res.writeHead(200,{'Content-Type':types[path.extname(file)],'Content-Length':content.length});
      res.end(req.method==='HEAD'?undefined:content);
    }catch {end(500,'Unable to load resource');}
  });
  server.requestTimeout=10000;
  server.headersTimeout=10000;
  server.keepAliveTimeout=5000;
  server.maxRequestsPerSocket=100;
  return server;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=process.env.PORT===undefined?5173:Number(process.env.PORT);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be an integer from 1 to 65535.');
  const server=createAppServer();
  server.on('error',error=>{console.error(`Cannot start local server: ${error.code}`);process.exitCode=1;});
  server.listen(port,'127.0.0.1',()=>console.log(`Hǎo is running at http://127.0.0.1:${server.address().port}`));
}
