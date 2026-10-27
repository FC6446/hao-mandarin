import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createAppServer } from '../server.js';
import { escapeHTML } from '../html.js';
import { emptyProgress, sanitizeProgress } from '../progress.js';
import { publicAssets, securityHeaders } from '../security.js';
import { lessons } from '../course.js';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

async function withServer(run) {
  const server=createAppServer();
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const port=server.address().port;
  function request(path='/',method='GET') {
    return new Promise((resolve,reject)=>{
      const req=http.request({hostname:'127.0.0.1',port,path,method},res=>{
        const chunks=[];res.on('data',chunk=>chunks.push(chunk));
        res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString()}));
      });
      req.on('error',reject);req.end();
    });
  }
  try {await run(request);} finally {await new Promise(resolve=>server.close(resolve));}
}

test('Public assets load with security headers and correct MIME types',async()=>withServer(async request=>{
  for(const asset of publicAssets){
    const response=await request('/'+asset);
    assert.equal(response.status,200,asset);
    assert.ok(response.body.length>0);
    for(const [key,value] of Object.entries(securityHeaders))assert.equal(response.headers[key.toLowerCase()],value);
    assert.match(response.headers['content-type'],/charset=utf-8/);
  }
  const head=await request('/','HEAD');assert.equal(head.status,200);assert.equal(head.body,'');assert.ok(Number(head.headers['content-length'])>0);
}));

test('Private files, traversal, encoded paths and malformed input are rejected',async()=>withServer(async request=>{
  for(const path of ['/.git/config','/.env','/work/github-private.mjs','/README.md','/server.js','/security.js','/package.json','/tests/security.test.js','/../index.html','/%2e%2e/index.html','/%2e%2e%2findex.html','/..%5cindex.html','//index.html','/index.html%00','/index.html/extra']){
    const response=await request(path);assert.equal(response.status,404,path);assert.ok(!response.body.includes('Bearer'));assert.equal(response.headers['x-frame-options'],'DENY');
  }
  assert.equal((await request('/%ZZ')).status,400);
}));

test('The server has no write endpoints',async()=>withServer(async request=>{
  for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS']){
    const response=await request('/',method);assert.equal(response.status,405);assert.equal(response.headers.allow,'GET, HEAD');
  }
}));

test('HTML escaping prevents markup and attribute injection',()=>{
  assert.equal(escapeHTML('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHTML("' & <script>"),'&#39; &amp; &lt;script&gt;');
  assert.equal(escapeHTML('你好 nǐ hǎo'),'你好 nǐ hǎo');
});

test('Local storage drops prototype keys, unknown reviews and non-numeric scores',()=>{
  const ids=lessons.map(l=>l.id);
  const raw=JSON.parse('{"reviews":{"__proto__":4,"constructor":6,"你好":2,"unknown":3},"results":{"pinyin":{"correct":"3"}},"activity":["2026-10-28",5,{}]}');
  const clean=sanitizeProgress(raw,ids,['你好','__proto__','constructor']);
  assert.deepEqual(clean.reviews,{'你好':2});assert.deepEqual(clean.results,{});assert.deepEqual(clean.activity,['2026-10-28']);
  assert.equal(Object.getPrototypeOf(clean.reviews),Object.prototype);
  assert.deepEqual(sanitizeProgress(null,ids),emptyProgress());
});

test('Build includes only public assets and enforces hosting headers',async()=>{
  execFileSync(process.execPath,['scripts/build.js'],{cwd:new URL('../',import.meta.url),stdio:'pipe'});
  assert.deepEqual((await readdir(new URL('../dist/',import.meta.url))).sort(),[...publicAssets,'_headers'].sort());
  const headers=await readFile(new URL('../dist/_headers',import.meta.url),'utf8');
  assert.ok(headers.startsWith('/*\n'));
  for(const [key,value] of Object.entries(securityHeaders))assert.ok(headers.includes(`${key}: ${value}`));
  assert.ok(headers.includes('Strict-Transport-Security: max-age=31536000'));
  assert.ok(!headers.includes('unsafe-inline'));assert.ok(!headers.includes('unsafe-eval'));
});
