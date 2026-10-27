import { mkdir, copyFile, writeFile, readdir } from 'node:fs/promises';
import { publicAssets, securityHeaders } from '../security.js';
const root=new URL('../',import.meta.url);
await mkdir(new URL('dist/',root),{recursive:true});
// Refuse unknown output files instead of accidentally publishing stale or private data.
const allowed=new Set([...publicAssets,'_headers']);
for(const entry of await readdir(new URL('dist/',root))) if(!allowed.has(entry)) throw new Error(`Unexpected file in dist/: ${entry}. Review and remove it before building.`);
for(const file of publicAssets) await copyFile(new URL(file,root),new URL(`dist/${file}`,root));
const headers={...securityHeaders,'Strict-Transport-Security':'max-age=31536000','Cache-Control':'no-cache'};
await writeFile(new URL('dist/_headers',root),'/*\n'+Object.entries(headers).map(([name,value])=>`  ${name}: ${value}`).join('\n')+'\n');
console.log('Build complete: dist/ contains the public app and static-host security headers.');
