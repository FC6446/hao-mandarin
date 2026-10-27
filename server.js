import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=new Set(['index.html','app.js','course.js','progress.js','theme.js','styles.css','dark.css']);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=pathname==='/'?'index.html':pathname.slice(1);
  if(!allowed.has(file)){res.writeHead(404);res.end('Nicht gefunden');return;}
  const content=await readFile(path.join(root,file));
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(content);
 }catch{res.writeHead(400);res.end('Ungültige Anfrage');}
});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log(`Hǎo läuft auf http://127.0.0.1:${server.address().port}`));
