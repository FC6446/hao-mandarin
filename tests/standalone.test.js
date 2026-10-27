import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Script,createContext} from 'node:vm';
import {readFile} from 'node:fs/promises';
import {buildStandalone} from '../scripts/build-standalone.js';
import {createProgressBackup,parseProgressBackup,emptyProgress} from '../progress.js';
import {lessons,vocabulary} from '../course.js';

test('Standalone HTML has no external assets, module imports or unapproved inline code',async()=>{
  const html=await buildStandalone();
  assert.ok(!/<script[^>]+src=|<link[^>]+rel="stylesheet"|type="module"/i.test(html));
  assert.ok(!/^import .+ from /m.test(html));
  assert.match(html,/<html lang="en">/);
  const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.ok(policy.includes("connect-src 'none'"));assert.ok(policy.includes("default-src 'none'"));
  assert.ok(!policy.includes('unsafe-inline'));assert.ok(!policy.includes('unsafe-eval'));assert.ok(!policy.includes("'self'"));
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,2);
  for(const [,source] of scripts){new Script(source);assert.ok(policy.includes(`'sha256-${createHash('sha256').update(source).digest('base64')}'`));}
  const styles=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  assert.ok(policy.includes(`'sha256-${createHash('sha256').update(styles).digest('base64')}'`));
  assert.ok(!/@import|url\(\s*['"]?https?:/i.test(styles));
  assert.equal(html,await readFile(new URL('../Hao.html',import.meta.url),'utf8'));
});

test('Progress backups transfer known results and reject unrelated or excessive data',()=>{
  const ids=lessons.map(l=>l.id), words=vocabulary.map(w=>w[0]);
  const progress=emptyProgress();progress.completed.push('pinyin');progress.results.pinyin={correct:3,total:3};progress.reviews['你好']=2;
  assert.deepEqual(parseProgressBackup(createProgressBackup(progress),ids,words),progress);
  for(const invalid of ['not json','{}','<script>alert(1)</script>','x'.repeat(100001),JSON.stringify({app:'hao-mandarin',version:2,progress})]) {
    assert.throws(()=>parseProgressBackup(invalid,ids,words));
  }
  const malicious=JSON.parse(createProgressBackup(progress));malicious.progress.reviews=JSON.parse('{"__proto__":1,"你好":4,"unrelated":6}');
  assert.deepEqual(parseProgressBackup(JSON.stringify(malicious),ids,words).reviews,{'你好':4});
});

test('Bundled scripts initialise with a local-file location, without network APIs',async()=>{
  // A small DOM test double checks the bundle lifecycle; this is not a real-browser file test.
  const nodes=new Map(), events=new Map(), stored=new Map();
  const element=()=>({innerHTML:'',textContent:'',dataset:{},listeners:{},classList:{add(){},remove(){},toggle(){}},
    setAttribute(){},append(){},querySelectorAll:()=>[],addEventListener(type,callback){this.listeners[type]=callback;}});
  const get=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
  const document={documentElement:element(),querySelector:get,querySelectorAll:()=>[],createElement:element,
    getElementById:id=>get('#'+id),addEventListener:(type,callback)=>events.set(type,callback)};
  const context=createContext({document,location:{protocol:'file:',hash:'#learn'},
    localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>stored.set(key,value)},
    window:{matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}},setTimeout:()=>0,clearTimeout(){}});
  const html=await readFile(new URL('../Hao.html',import.meta.url),'utf8');
  for(const [,script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new Script(script).runInContext(context,{timeout:1000});
  events.get('DOMContentLoaded')();
  assert.ok(get('#content').innerHTML.includes('My first lesson'));
  assert.ok(get('#content').innerHTML.includes('Hello, Mandarin!'));
  assert.equal(document.documentElement.dataset.theme,'light');
  get('#theme-toggle').listeners.click();
  assert.equal(document.documentElement.dataset.theme,'dark');
  assert.equal(stored.get('hao-theme-v1'),'dark');
});
