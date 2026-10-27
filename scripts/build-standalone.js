import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=new URL('../',import.meta.url);
const read=file=>readFile(new URL(file,root),'utf8').then(text=>text.replace(/\r\n?/g,'\n'));
const hash=text=>`'sha256-${createHash('sha256').update(text).digest('base64')}'`;
function classic(source) {
  return source.replace(/^import .+ from ['"].+['"];?\s*$/gm,'')
    .replace(/^export (?=(?:const|function) )/gm,'');
}
export async function buildStandalone() {
  const styles=(await read('styles.css'))+'\n'+(await read('dark.css'));
  const theme=await read('theme.js');
  const modules=await Promise.all(['course.js','progress.js','html.js','app.js'].map(read));
  const app='(()=>{\n'+modules.map(classic).join('\n').replace('const $ = s =>', 'const escape = escapeHTML;\nconst $ = s =>')+'\n})();';
  // Prevent HTML raw-text termination without weakening the CSP.
  const scripts=[theme,app].map(script=>script.replace(/<\/script/gi,'<\\/script'));
  if(/<\/style/i.test(styles))throw new Error('Unexpected closing style tag in CSS.');
  const policy=["default-src 'none'",`script-src ${scripts.map(hash).join(' ')}`,`style-src ${hash(styles)}`,
    "img-src data:","connect-src 'none'","object-src 'none'","base-uri 'none'","form-action 'none'",
    "frame-src 'none'","worker-src 'none'","manifest-src 'none'"].join('; ');
  let html=await read('index.html');
  html=html.replace('<meta charset="UTF-8">',`<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer">`)
    .replace('  <script src="theme.js"></script>',`  <script>${scripts[0]}</script>`)
    .replace('  <link rel="stylesheet" href="styles.css">',`  <style>${styles}</style>`)
    .replace('  <link rel="stylesheet" href="dark.css">','')
    .replace('  <script type="module" src="app.js"></script>','')
    .replace('</body>',`<script>${scripts[1]}</script>\n</body>`);
  await writeFile(new URL('Hao.html',root),html);
  return html;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  await buildStandalone();console.log('Standalone build complete: open Hao.html directly in your browser.');
}
