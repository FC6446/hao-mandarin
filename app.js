import { lessons, sections, vocabulary } from './course.js';
import { STORAGE_KEY, emptyProgress, sanitizeProgress, isUnlocked, matchesAnswer, localDay } from './progress.js';
import { escapeHTML as escape } from './html.js';

const $ = s => document.querySelector(s);
let storageAvailable = true;
let state;
try {
 const saved=localStorage.getItem(STORAGE_KEY);
 state=sanitizeProgress(saved && saved.length<=100000 ? JSON.parse(saved) : null,lessons.map(l=>l.id),vocabulary.map(w=>w[0]));
}
catch { state = emptyProgress(); storageAvailable = false; }
const dialog = $('#lesson-dialog');
let session = null;
function save() {
  state.activity = [...new Set([...state.activity, localDay()])].slice(-366);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; toast('Unable to save. Your progress will last only until you close this page.'); }
}
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(()=>$('#toast').classList.remove('visible'),5000); }
const learnedWords = () => vocabulary.filter(w=>state.completed.includes(w[5]));
const nextLesson = () => lessons.find(l=>!state.completed.includes(l.id)) || lessons[0];
function render() {
  const aliases = { lernen:'learn', wiederholen:'review', wortschatz:'vocabulary' };
  const hash = location.hash.slice(1);
  const view = ['learn','review','vocabulary'].includes(hash) ? hash : Object.hasOwn(aliases,hash) ? aliases[hash] : 'learn';
  document.querySelectorAll('[data-view]').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  $('#review-badge').textContent = learnedWords().length;
  $('#content').innerHTML = view === 'review' ? reviewPage() : view === 'vocabulary' ? vocabularyPage() : coursePage();
  $('#content').querySelectorAll('[data-lesson]').forEach(b=>b.addEventListener('click',()=>openLesson(b.dataset.lesson)));
  $('#start-review')?.addEventListener('click', startReview);
  $('#word-search')?.addEventListener('input', filterWords);
}
function coursePage() {
  const completed = state.completed.length;
  const next = nextLesson();
  const percent = Math.round(completed/lessons.length*100);
  return `<section class="page-heading"><div><p class="eyebrow">你好 NǏ HǍO · GOOD TO SEE YOU</p><h1>Your path to Mandarin<span>.</span></h1><p>From your first tone to your first conversation.<br class="desktop-break"> Learn at your own pace, one small step at a time.</p></div><span class="level-pill">✧ For complete beginners</span></section>
  <section class="hero"><div class="hero-copy"><p class="eyebrow">${completed===lessons.length?'YOUR FOUNDATIONS ARE IN PLACE':'YOUR NEXT STEP'}</p><h2>${completed===lessons.length?'好极了！Well done.':completed===0?'A new language.<br>A new perspective.':escape(next.title)}</h2><p>${completed===lessons.length?'You have completed every lesson. Keep your knowledge fresh with a review.':completed===0?'Start with Pinyin and discover the sounds of Mandarin.<br>No prior knowledge needed. Just a little curiosity.':escape(next.subtitle)+' · With a short explanation and three exercises.'}</p><button class="button light" ${completed===lessons.length?'id="start-review"':`data-lesson="${next.id}"`}>${completed===0?'My first lesson':completed===lessons.length?'Review words':'Continue learning'} <span>↗</span></button><small>◷ ${next.minutes} minutes &nbsp; · &nbsp; Explained step by step</small></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="art-small">一点一滴</span><span class="art-character">学</span><span class="art-caption">xué &nbsp; / &nbsp; learn</span><span class="spark">✳</span></div></section>
  <section class="stats" aria-label="Your progress"><div><span class="stat-icon">▦</span><div><strong>${completed}<span> / ${lessons.length}</span></strong><small>Lessons completed</small></div></div><div><span class="stat-icon peach">字</span><div><strong>${learnedWords().length}</strong><small>Words unlocked</small></div></div><div><span class="stat-icon lavender">✧</span><div><strong>${state.activity.length}</strong><small>Active learning days</small></div></div><div class="total-progress"><div><b>Your course progress</b><strong>${percent}%</strong></div><progress value="${completed}" max="${lessons.length}" aria-label="Course progress">${percent}%</progress></div></section>
  <div class="path-heading"><div><p class="eyebrow">YOUR LEARNING PATH</p><h2>Every journey starts with a first step.</h2></div><span>${lessons.length} lessons · 3 chapters</span></div>
  <div class="course-layout"><div class="chapters">${sections.map((s,si)=>`<section class="chapter ${escape(s.color)}"><div class="chapter-heading"><span class="chapter-number">${escape(s.label)}</span><div><h3>${escape(s.title)}</h3><p>${escape(s.description)}</p></div><span class="chapter-count">${lessons.filter(l=>l.section===si&&state.completed.includes(l.id)).length}/${lessons.filter(l=>l.section===si).length}</span></div><div class="lesson-list">${lessons.map((l,i)=>({l,i})).filter(({l})=>l.section===si).map(({l,i})=>{
    const done=state.completed.includes(l.id), unlocked=isUnlocked(i,state,lessons), current=l.id===next.id;
    return `<button class="lesson ${done?'done':''} ${current?'current':''}" data-lesson="${escape(l.id)}" ${unlocked?'':'disabled'}><span class="lesson-node">${done?'✓':unlocked?String(i+1).padStart(2,'0'):'⌑'}</span><span class="lesson-info"><strong>${escape(l.title)} ${current?'<span class="next-tag">UP NEXT</span>':''}</strong><small>${escape(l.subtitle)}</small></span><span class="lesson-time">${l.minutes} min</span><span class="lesson-arrow">${done?'✓':unlocked?'↗':'Locked'}</span></button>`;
  }).join('')}</div></section>`).join('')}</div><aside class="path-aside"><div class="daily-card"><span class="mini-label">YOUR FIRST WORD</span><span class="daily-hanzi" lang="zh">你好</span><span class="daily-pinyin">nǐ hǎo</span><h3>Hello, new world.</h3><p>Two characters. Two syllables.<br>The beginning of something bigger.</p><div class="tone-chips"><span>nǐ <b>3rd tone</b></span><span>hǎo <b>3rd tone</b></span></div></div><div class="note-card"><span>✺</span><h3>A little, often.</h3><p>A few minutes a day help you stay consistent. Revisit familiar words before learning something new.</p><a href="#review">Review what you know <span>→</span></a></div><div class="audio-note">ⓘ <span>Audio is not available yet. Tone exercises currently use visual cues.</span></div></aside></div>`;
}
function reviewPage() {
 const words = learnedWords();
 return `<section class="page-heading"><div><p class="eyebrow">KNOWLEDGE THAT STAYS</p><h1>One more time. A little more confident<span>.</span></h1><p>Review words from your completed lessons.</p></div></section><section class="review-hero"><span class="review-symbol">↻</span><h2>${words.length?`${words.length} ${words.length===1?'word is waiting':'words are waiting'} for you.`:'Your vocabulary grows with you.'}</h2><p>${words.length?'Up to five short exercises. Words with fewer correct reviews come first.':'Complete your first lesson to unlock word reviews.'}</p>${words.length?'<button class="button" id="start-review">Start review ↗</button>':`<button class="button" data-lesson="${escape(nextLesson().id)}">Take your next step ↗</button>`}</section><section class="chapter"><h2>Practise earlier lessons</h2><p>Open a completed lesson to revisit its explanation and exercises.</p><div class="repeat-grid">${lessons.filter(l=>state.completed.includes(l.id)).map(l=>`<button data-lesson="${escape(l.id)}"><span lang="zh">${escape(l.glyph)}</span><strong>${escape(l.title)}</strong><small>Last result: ${state.results[l.id]?.correct??0}/3 correct</small></button>`).join('') || '<p>No lessons completed yet.</p>'}</div></section>`;
}
function vocabularyPage() {
 return `<section class="page-heading"><div><p class="eyebrow">CHARACTER BY CHARACTER</p><h1>Your growing vocabulary<span>.</span></h1><p>Look up all ${vocabulary.length} course words. Words you have learned are marked.</p></div></section><label class="search-label">Find a word<input id="word-search" type="search" placeholder="Hanzi, Pinyin or English meaning …"></label><p id="search-count" role="status">${vocabulary.length} words</p><div class="word-grid" id="word-grid">${vocabulary.map(w=>`<article class="word-card" data-search="${escape(w.slice(0,3).join(' ').toLowerCase())}"><div><span lang="zh" class="word-hanzi">${escape(w[0])}</span>${state.completed.includes(w[5])?'<span class="learned-tag">✓ Learned</span>':''}</div><p class="pinyin">${escape(w[1])}</p><h3>${escape(w[2])}</h3><hr><p lang="zh">${escape(w[3])}</p><small>${escape(w[4])}</small></article>`).join('')}</div>`;
}
function filterWords(event) {
 const query=event.target.value.toLowerCase().normalize('NFD').replace(/\p{M}/gu,''); let count=0;
 document.querySelectorAll('[data-search]').forEach(card=>{card.hidden=!card.dataset.search.normalize('NFD').replace(/\p{M}/gu,'').includes(query);if(!card.hidden)count++;});
 $('#search-count').textContent=count?`${count} ${count===1?'word':'words'}`:'No matching words found.';
}
function showDialog(html) {
 dialog.innerHTML=`<button class="close-dialog" aria-label="Close">×</button>${html}`;
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
 showDialog(`<p class="eyebrow">CHAPTER ${l.section+1} · ${l.minutes} MINUTES</p><h2 id="lesson-title">${escape(l.title)}</h2><div class="lesson-banner" lang="zh">${escape(l.glyph)}</div><h3>${escape(l.subtitle)}</h3><p class="explanation">${escape(l.explanation)}</p>${l.tip?`<aside class="lesson-tip">ⓘ ${escape(l.tip)}</aside>`:''}${l.dialogue?`<div class="dialogue">${l.dialogue.map(line=>`<div><strong lang="zh">${escape(line[0])}</strong><span>${escape(line[1])}</span><p>${escape(line[2])}</p></div>`).join('')}</div>`:''}<button id="begin-exercises" class="button">Practise now <span>→</span></button>`);
 $('#begin-exercises').addEventListener('click',renderExercise);
}
function renderExercise() {
 const s=session, exercises=s.review?s.exercises:s.lesson.exercises, e=exercises[s.step];s.answered=false;
 showDialog(`<p class="eyebrow">${s.review?'REVIEW':escape(s.lesson.title)} · EXERCISE ${s.step+1} OF ${exercises.length}</p><h2 id="lesson-title">${s.review?'Do you remember?':'Give it a try.'}</h2><progress value="${s.step}" max="${exercises.length}" aria-label="Exercise progress"></progress><h3 class="question">${escape(e.prompt)}</h3><form id="answer-form">${e.type==='choice'?`<div class="choices">${e.options.map((o,i)=>`<label><input type="radio" name="answer" value="${i}" required><span>${escape(o)}</span></label>`).join('')}</div>`:`<label class="input-label">Your answer<input name="answer" autocomplete="off" required maxlength="120" placeholder="Pinyin with tone marks or numbers" aria-describedby="input-help"></label><small id="input-help">Use tone marks or numbers (e.g. nǐ or ni3); enter characters for Hanzi questions.</small>`}<div id="feedback" aria-live="polite"></div><button class="button" type="submit">Check answer</button></form>`);
 $('#answer-form').addEventListener('submit',checkAnswer);
}
function checkAnswer(event) {
 event.preventDefault(); const s=session, exercises=s.review?s.exercises:s.lesson.exercises, e=exercises[s.step];
 if(s.answered)return; const value=new FormData(event.target).get('answer'); if(!String(value??'').trim())return;
 s.answered=true;
 const correct=e.type==='choice'?Number(value)===e.answer:matchesAnswer(value,e.answers);
 if(correct)s.correct++;else s.retry.push(s.step);
 if(s.review && correct){state.reviews[e.word]=Math.min(100000,(state.reviews[e.word]||0)+1);save();}
 const feedback=$('#feedback');feedback.className=`feedback ${correct?'correct':'incorrect'}`;
 feedback.innerHTML=`<strong>${correct?'✓ Exactly right!':'Not quite yet.'}</strong><p>${!correct?`Correct answer: ${escape(e.type==='choice'?e.options[e.answer]:e.answers[0])}. `:''}${escape(e.explanation)}</p>`;
 event.target.querySelectorAll('input').forEach(i=>i.disabled=true);
 const button=event.target.querySelector('button');button.type='button';button.textContent=s.step+1===exercises.length?'See results →':'Next exercise →';button.addEventListener('click',()=>{s.step++;if(s.step<exercises.length)renderExercise();else finishSession();},{once:true});button.focus();
}
function finishSession() {
 const s=session, total=s.review?s.exercises.length:s.lesson.exercises.length, passed=s.correct===total;
 if(!s.review){state.results[s.lesson.id]={correct:s.correct,total};if(passed&&!state.completed.includes(s.lesson.id))state.completed.push(s.lesson.id);save();}
 render();
 showDialog(`<div class="completion-icon">${passed?'✧':'↻'}</div><p class="eyebrow">${s.review?'REVIEW COMPLETE':passed?'LESSON COMPLETE':'ONE MORE ROUND'}</p><h2 id="lesson-title">${passed?'好！Well done.':'You are making progress.'}</h2><p class="result-score">${s.correct}<span> / ${total}</span></p><p>${s.review?'Every review helps your knowledge stick.':passed?'Your progress is saved. The next lesson is now available.':'Read the explanation again and try once more. Get all three answers right to unlock the next lesson.'}</p>${!storageAvailable?'<p class="lesson-tip">Browser storage is unavailable. Progress will last only for this session.</p>':''}<button id="finish-action" class="button">${s.review?'Back to overview':passed&&state.completed.length<lessons.length?'Next lesson →':passed?'Back to overview':'Try the lesson again →'}</button><button id="finish-close" class="text-button">Close</button>`);
 $('#finish-action').addEventListener('click',()=>{if(s.review||passed&&state.completed.length===lessons.length)dialog.close();else openLesson(passed?nextLesson().id:s.lesson.id);});
 $('#finish-close').addEventListener('click',()=>dialog.close());
}
function startReview() {
 const words=[...learnedWords()].sort((a,b)=>(state.reviews[a[0]]||0)-(state.reviews[b[0]]||0)).slice(0,5);
 if(!words.length)return;
 const exercises=words.map(w=>{const distractors=vocabulary.filter(v=>v[2]!==w[2]).slice(0,3).map(v=>v[2]);const options=[w[2],...distractors].sort(()=>Math.random()-.5);return {type:'choice',prompt:`What does ${w[0]} (${w[1]}) mean?`,options,answer:options.indexOf(w[2]),explanation:`${w[3]} – ${w[4]}`,word:w[0]};});
 session={review:true,exercises,step:0,correct:0,answered:false,retry:[]};renderExercise();
}
$('#settings').addEventListener('click',()=>{
 showDialog(`<p class="eyebrow">YOUR DEVICE, YOUR PROGRESS</p><h2 id="lesson-title">Local storage</h2><p>Completed lessons, latest results, correct word reviews and active learning days are stored in this browser. There is no account or synchronisation. Clearing browser data deletes your progress.</p><p>${storageAvailable?'Browser storage is available.':'Browser storage is unavailable. Progress will last only for this session.'}</p><button id="reset-progress" class="button danger">Reset learning progress</button><div id="reset-confirm"></div>`);
 $('#reset-progress').addEventListener('click',()=>{
  $('#reset-confirm').innerHTML='<p>Really delete all local learning results?</p><button id="confirm-reset" class="button danger">Yes, delete progress</button>';
  $('#confirm-reset').addEventListener('click',()=>{state=emptyProgress();try{localStorage.removeItem(STORAGE_KEY);}catch{}render();dialog.close();toast('Your learning path starts again at lesson 1.');});
 });
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
render();
if(!storageAvailable)toast('Browser storage is unavailable. Progress will last only for this session.');
