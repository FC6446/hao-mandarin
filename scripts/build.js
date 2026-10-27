import { mkdir, copyFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('dist/',root),{recursive:true});
for(const file of ['index.html','styles.css','dark.css','app.js','course.js','progress.js','theme.js']) await copyFile(new URL(file,root),new URL(`dist/${file}`,root));
console.log('Build erfolgreich: dist/ enthält die statische App.');
