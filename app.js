import { lessons, sections, vocabulary } from './course.js';
import { STORAGE_KEY, emptyProgress, sanitizeProgress, isUnlocked, matchesAnswer, localDay } from './progress.js';

const $ = s => document.querySelector(s);
let storageAvailable = true;
let state;
try { state = sanitizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)), lessons.map(l=>l.id)); }
catch { state = emptyProgress(); storageAvailable = false; }
const dialog = $('#lesson-dialog');
let session = null;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save() {
  state.activity = [...new Set([...state.activity, localDay()])].slice(-366);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; toast('Speichern nicht möglich. Dein Fortschritt bleibt nur bis zum Schließen erhalten.'); }
}
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(()=>$('#toast').classList.remove('visible'),5000); }
const learnedWords = () => vocabulary.filter(w=>state.completed.includes(w[5]));
const nextLesson = () => lessons.find(l=>!state.completed.includes(l.id)) || lessons[0];
function render() {
  const view = location.hash.slice(1) || 'lernen';
  document.querySelectorAll('[data-view]').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  $('#review-badge').textContent = learnedWords().length;
  $('#content').innerHTML = view === 'wiederholen' ? reviewPage() : view === 'wortschatz' ? vocabularyPage() : coursePage();
  $('#content').querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.lesson)));
  $('#start-review')?.addEventListener('click', startReview);
  $('#word-search')?.addEventListener('input', filterWords);
}
function coursePage() {
  const completed = state.completed.length;
  const next = nextLesson();
  const percent = Math.round(completed/lessons.length*100);
  return `<section class="page-heading"><div><p class="eyebrow">你好 NǏ HǍO · SCHÖN, DASS DU DA BIST</p><h1>Dein Weg ins Mandarin<span>.</span></h1><p>Von deinem ersten Ton bis zu deinem ersten Gespräch.<br class="desktop-break"> Lerne in deinem Tempo – einen kleinen Schritt nach dem anderen.</p></div><span class="level-pill">✧ Für echte Anfänger</span></section>
  <section class="hero"><div class="hero-copy"><p class="eyebrow">${completed===lessons.length?'DEIN FUNDAMENT STEHT':'DEIN NÄCHSTER SCHRITT'}</p><h2>${completed===lessons.length?'好极了！Gut gemacht.':completed===0?'Eine neue Sprache.<br>Eine neue Perspektive.':escape(next.title)}</h2><p>${completed===lessons.length?'Du hast alle Lektionen geschafft. Festige dein Wissen mit einer Wiederholung.':completed===0?'Beginne mit Pinyin und entdecke, wie Mandarin klingt.<br>Du brauchst keine Vorkenntnisse. Nur ein bisschen Neugier.':escape(next.subtitle)+' · Mit Erklärung und drei Übungen.'}</p><button class="button light" ${completed===lessons.length?'id="start-review"':`data-lesson="${next.id}"`}>${completed===0?'Meine erste Lektion':completed===lessons.length?'Wörter wiederholen':'Weiterlernen'} <span>↗</span></button><small>◷ ${next.minutes} Minuten &nbsp; · &nbsp; Schritt für Schritt erklärt</small></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="art-small">一点一滴</span><span class="art-character">学</span><span class="art-caption">xué &nbsp; / &nbsp; lernen</span><span class="spark">✳</span></div></section>
  <section class="stats" aria-label="Dein Fortschritt"><div><span class="stat-icon">▦</span><div><strong>${completed}<span> / ${lessons.length}</span></strong><small>Lektionen abgeschlossen</small></div></div><div><span class="stat-icon peach">字</span><div><strong>${learnedWords().length}</strong><small>Wörter freigeschaltet</small></div></div><div><span class="stat-icon lavender">✧</span><div><strong>${state.activity.length}</strong><small>Aktive Lerntage</small></div></div><div class="total-progress"><div><b>Dein Kursfortschritt</b><strong>${percent}%</strong></div><progress value="${completed}" max="${lessons.length}" aria-label="Kursfortschritt">${percent}%</progress></div></section>
  <div class="path-heading"><div><p class="eyebrow">DEIN LERNPFAD</p><h2>Alles beginnt mit einem ersten Schritt.</h2></div><span>${lessons.length} Lektionen · 3 Kapitel</span></div>
  <div class="course-layout"><div class="chapters">${sections.map((s,si)=>`<section class="chapter ${s.color}"><div class="chapter-heading"><span class="chapter-number">${s.label}</span><div><h3>${s.title}</h3><p>${s.description}</p></div><span class="chapter-count">${lessons.filter(l=>l.section===si&&state.completed.includes(l.id)).length}/${lessons.filter(l=>l.section===si).length}</span></div><div class="lesson-list">${lessons.map((l,i)=>({l,i})).filter(({l})=>l.section===si).map(({l,i})=>{
    const done=state.completed.includes(l.id), unlocked=isUnlocked(i,state,lessons), current=l.id===next.id;
    return `<button class="lesson ${done?'done':''} ${current?'current':''}" data-lesson="${l.id}" ${unlocked?'':'disabled'}><span class="lesson-node">${done?'✓':unlocked?String(i+1).padStart(2,'0'):'⌑'}</span><span class="lesson-info"><strong>${l.title} ${current?'<span class="next-tag">ALS NÄCHSTES</span>':''}</strong><small>${l.subtitle}</small></span><span class="lesson-time">${l.minutes} Min.</span><span class="lesson-arrow">${done?'✓':unlocked?'↗':'Gesperrt'}</span></button>`;
  }).join('')}</div></section>`).join('')}</div><aside class="path-aside"><div class="daily-card"><span class="mini-label">DEIN ERSTES WORT</span><span class="daily-hanzi" lang="zh">你好</span><span class="daily-pinyin">nǐ hǎo</span><h3>Hallo, neue Welt.</h3><p>Zwei Zeichen. Zwei Silben.<br>Der Anfang von etwas Großem.</p><div class="tone-chips"><span>nǐ <b>3. Ton</b></span><span>hǎo <b>3. Ton</b></span></div></div><div class="note-card"><span>✺</span><h3>Lieber kurz. Dafür öfter.</h3><p>Ein paar Minuten am Tag helfen dir, dranzubleiben. Wiederhole Bekanntes, bevor du Neues lernst.</p><a href="#wiederholen">Zur Wiederholung <span>→</span></a></div><div class="audio-note">ⓘ <span>Audio folgt später. Tonübungen sind aktuell visuell gekennzeichnet.</span></div></aside></div>`;
}
function reviewPage() {
 const words = learnedWords();
 return `<section class="page-heading"><div><p class="eyebrow">WISSEN, DAS BLEIBT</p><h1>Einmal mehr. Ein bisschen sicherer<span>.</span></h1><p>Wiederhole Wörter aus deinen abgeschlossenen Lektionen.</p></div></section><section class="review-hero"><span class="review-symbol">↻</span><h2>${words.length?`${words.length} ${words.length===1?'Wort wartet':'Wörter warten'} auf dich.`:'Dein Wortschatz wächst mit dir.'}</h2><p>${words.length?'Bis zu fünf kurze Aufgaben. Wörter mit wenigen richtigen Wiederholungen kommen zuerst.':'Schließe deine erste Lektion ab, um hier Wörter zu wiederholen.'}</p>${words.length?'<button class="button" id="start-review">Wiederholung starten ↗</button>':`<button class="button" data-lesson="${nextLesson().id}">Zum nächsten Lernschritt ↗</button>`}</section><section class="chapter"><h2>Frühere Lektionen erneut üben</h2><p>Öffne eine abgeschlossene Lektion, um ihre Erklärung und Übungen zu wiederholen.</p><div class="repeat-grid">${lessons.filter(l=>state.completed.includes(l.id)).map(l=>`<button data-lesson="${l.id}"><span lang="zh">${l.glyph}</span><strong>${l.title}</strong><small>Letztes Ergebnis: ${state.results[l.id]?.correct??0}/3 richtig</small></button>`).join('') || '<p>Noch keine Lektion abgeschlossen.</p>'}</div></section>`;
}
function vocabularyPage() {
 return `<section class="page-heading"><div><p class="eyebrow">ZEICHEN FÜR ZEICHEN</p><h1>Dein kleiner Wortschatz<span>.</span></h1><p>Alle ${vocabulary.length} Kurswörter zum Nachschlagen. Bereits gelernte Wörter sind markiert.</p></div></section><label class="search-label">Wort suchen<input id="word-search" type="search" placeholder="Hanzi, Pinyin oder deutsche Bedeutung …"></label><p id="search-count" role="status">${vocabulary.length} Wörter</p><div class="word-grid" id="word-grid">${vocabulary.map(w=>`<article class="word-card" data-search="${escape(w.slice(0,3).join(' ').toLowerCase())}"><div><span lang="zh" class="word-hanzi">${w[0]}</span>${state.completed.includes(w[5])?'<span class="learned-tag">✓ Gelernt</span>':''}</div><p class="pinyin">${w[1]}</p><h3>${w[2]}</h3><hr><p lang="zh">${w[3]}</p><small>${w[4]}</small></article>`).join('')}</div>`;
}
function filterWords(event) {
 const query=event.target.value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,''); let count=0;
 document.querySelectorAll('[data-search]').forEach(card=>{card.hidden=!card.dataset.search.normalize('NFD').replace(/\p{M}/gu,'').includes(query);if(!card.hidden)count++;});
 $('#search-count').textContent=count?`${count} ${count===1?'Wort':'Wörter'}`:'Keine passenden Wörter gefunden.';
}
function showDialog(html) {
 dialog.innerHTML=`<button class="close-dialog" aria-label="Schließen">×</button>${html}`;
 dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
 if(!dialog.open)dialog.showModal();
 const heading=dialog.querySelector('#lesson-title');
 heading.setAttribute('tabindex','-1');
 heading.focus({preventScroll:true});
 dialog.scrollTop=0;
}
function openLesson(id) {
 const i=lessons.findIndex(l=>l.id===id); if(i<0 || !isUnlocked(i,state,lessons))return;
 session={lesson:lessons[i], step:0, correct:0, answered:false, retry:[]};
 const l=session.lesson;
 showDialog(`<p class="eyebrow">KAPITEL ${l.section+1} · ${l.minutes} MINUTEN</p><h2 id="lesson-title">${l.title}</h2><div class="lesson-banner" lang="zh">${l.glyph}</div><h3>${l.subtitle}</h3><p class="explanation">${l.explanation}</p>${l.tip?`<aside class="lesson-tip">ⓘ ${l.tip}</aside>`:''}${l.dialogue?`<div class="dialogue">${l.dialogue.map(line=>`<div><strong lang="zh">${line[0]}</strong><span>${line[1]}</span><p>${line[2]}</p></div>`).join('')}</div>`:''}<button id="begin-exercises" class="button">Jetzt üben <span>→</span></button>`);
 $('#begin-exercises').addEventListener('click',renderExercise);
}
function renderExercise() {
 const s=session, exercises=s.review?s.exercises:s.lesson.exercises, e=exercises[s.step];s.answered=false;
 showDialog(`<p class="eyebrow">${s.review?'WIEDERHOLUNG':escape(s.lesson.title)} · AUFGABE ${s.step+1} VON ${exercises.length}</p><h2 id="lesson-title">${s.review?'Erinnerst du dich?':'Probier es aus.'}</h2><progress value="${s.step}" max="${exercises.length}" aria-label="Übungsfortschritt"></progress><h3 class="question">${e.prompt}</h3><form id="answer-form">${e.type==='choice'?`<div class="choices">${e.options.map((o,i)=>`<label><input type="radio" name="answer" value="${i}" required><span>${o}</span></label>`).join('')}</div>`:`<label class="input-label">Deine Antwort<input name="answer" autocomplete="off" required maxlength="120" placeholder="Pinyin mit Tonzeichen oder Tonzahlen" aria-describedby="input-help"></label><small id="input-help">Tonzeichen oder Tonzahlen (z. B. nǐ oder ni3); bei Hanzi-Aufgaben die Zeichen eingeben.</small>`}<div id="feedback" aria-live="polite"></div><button class="button" type="submit">Antwort prüfen</button></form>`);
 $('#answer-form').addEventListener('submit',checkAnswer);
}
function checkAnswer(event) {
 event.preventDefault(); const s=session, exercises=s.review?s.exercises:s.lesson.exercises, e=exercises[s.step];
 if(s.answered)return; const value=new FormData(event.target).get('answer'); if(!String(value??'').trim())return;
 s.answered=true;
 const correct=e.type==='choice'?Number(value)===e.answer:matchesAnswer(value,e.answers);
 if(correct)s.correct++;else s.retry.push(s.step);
 if(s.review && correct){state.reviews[e.word]=(state.reviews[e.word]||0)+1;save();}
 const feedback=$('#feedback');feedback.className=`feedback ${correct?'correct':'incorrect'}`;
 feedback.innerHTML=`<strong>${correct?'✓ Genau richtig!':'Noch nicht ganz.'}</strong><p>${!correct?`Richtige Antwort: ${escape(e.type==='choice'?e.options[e.answer]:e.answers[0])}. `:''}${e.explanation}</p>`;
 event.target.querySelectorAll('input').forEach(i=>i.disabled=true);
 const button=event.target.querySelector('button');button.type='button';button.textContent=s.step+1===exercises.length?'Ergebnis ansehen →':'Nächste Aufgabe →';button.addEventListener('click',()=>{s.step++;if(s.step<exercises.length)renderExercise();else finishSession();},{once:true});button.focus();
}
function finishSession() {
 const s=session, total=s.review?s.exercises.length:s.lesson.exercises.length, passed=s.correct===total;
 if(!s.review){state.results[s.lesson.id]={correct:s.correct,total};if(passed&&!state.completed.includes(s.lesson.id))state.completed.push(s.lesson.id);save();}
 render();
 showDialog(`<div class="completion-icon">${passed?'✧':'↻'}</div><p class="eyebrow">${s.review?'WIEDERHOLUNG GESCHAFFT':passed?'LEKTION ABGESCHLOSSEN':'NOCH EINE KLEINE RUNDE'}</p><h2 id="lesson-title">${passed?'好！Gut gemacht.':'Du bist auf dem Weg.'}</h2><p class="result-score">${s.correct}<span> / ${total}</span></p><p>${s.review?'Jede Wiederholung macht dein Wissen ein Stück sicherer.':passed?'Dein Fortschritt ist gespeichert. Die nächste Lektion ist jetzt verfügbar.':'Lies die Erklärung noch einmal und versuche es erneut. Mit allen drei richtigen Antworten öffnest du die nächste Lektion.'}</p>${!storageAvailable?'<p class="lesson-tip">Speicherung im Browser ist nicht verfügbar. Fortschritt bleibt nur in dieser Sitzung.</p>':''}<button id="finish-action" class="button">${s.review?'Zur Übersicht':passed&&state.completed.length<lessons.length?'Nächste Lektion →':passed?'Zur Übersicht':'Lektion noch einmal →'}</button><button id="finish-close" class="text-button">Schließen</button>`);
 $('#finish-action').addEventListener('click',()=>{if(s.review||passed&&state.completed.length===lessons.length)dialog.close();else openLesson(passed?nextLesson().id:s.lesson.id);});
 $('#finish-close').addEventListener('click',()=>dialog.close());
}
function startReview() {
 const words=[...learnedWords()].sort((a,b)=>(state.reviews[a[0]]||0)-(state.reviews[b[0]]||0)).slice(0,5);
 if(!words.length)return;
 const exercises=words.map(w=>{const distractors=vocabulary.filter(v=>v[2]!==w[2]).slice(0,3).map(v=>v[2]);const options=[w[2],...distractors].sort(()=>Math.random()-.5);return {type:'choice',prompt:`Was bedeutet ${w[0]} (${w[1]})?`,options,answer:options.indexOf(w[2]),explanation:`${w[3]} – ${w[4]}`,word:w[0]};});
 session={review:true,exercises,step:0,correct:0,answered:false,retry:[]};renderExercise();
}
$('#settings').addEventListener('click',()=>{
 showDialog(`<p class="eyebrow">DEIN GERÄT, DEIN FORTSCHRITT</p><h2 id="lesson-title">Lokaler Speicher</h2><p>Abgeschlossene Lektionen, letzte Ergebnisse, richtige Wortwiederholungen und aktive Lerntage werden im lokalen Speicher dieses Browsers gespeichert. Es gibt kein Konto und keine Synchronisierung. Beim Löschen der Browserdaten geht der Fortschritt verloren.</p><p>${storageAvailable?'Der Browserspeicher ist verfügbar.':'Der Browserspeicher ist nicht verfügbar. Fortschritt bleibt nur in dieser Sitzung.'}</p><button id="reset-progress" class="button danger">Lernfortschritt zurücksetzen</button><div id="reset-confirm"></div>`);
 $('#reset-progress').addEventListener('click',()=>{
  $('#reset-confirm').innerHTML='<p>Alle lokalen Lernergebnisse wirklich löschen?</p><button id="confirm-reset" class="button danger">Ja, Fortschritt löschen</button>';
  $('#confirm-reset').addEventListener('click',()=>{state=emptyProgress();try{localStorage.removeItem(STORAGE_KEY);}catch{}render();dialog.close();toast('Dein Lernpfad beginnt wieder bei Lektion 1.');});
 });
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
render();
if(!storageAvailable)toast('Browserspeicher nicht verfügbar. Fortschritt bleibt nur in dieser Sitzung.');
