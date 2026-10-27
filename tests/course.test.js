import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons, sections, vocabulary } from '../course.js';
import { emptyProgress, sanitizeProgress, isUnlocked, matchesAnswer, localDay } from '../progress.js';
test('Course IDs, exercises and vocabulary references are valid',()=>{
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 for(const l of lessons){assert.ok(sections[l.section]);assert.ok(l.explanation.length>100);assert.equal(l.exercises.length,3);for(const e of l.exercises){if(e.type==='choice'){assert.ok(e.options[e.answer]);assert.equal(new Set(e.options).size,e.options.length);}else assert.ok(e.answers.length);}}
 for(const w of vocabulary)assert.ok(lessons.some(l=>l.id===w[5]));
});
test('Learning path unlocks only the next lesson',()=>{
 const state=emptyProgress();assert.ok(isUnlocked(0,state,lessons));assert.equal(isUnlocked(1,state,lessons),false);
 state.completed.push(lessons[0].id);assert.ok(isUnlocked(1,state,lessons));assert.equal(isUnlocked(2,state,lessons),false);
});
test('Saved progress survives JSON round trips and rejects damaged data',()=>{
 const ids=lessons.map(l=>l.id);const state=emptyProgress();state.completed.push(ids[0]);state.results[ids[0]]={correct:3,total:3};state.activity.push('2026-10-27');
 assert.deepEqual(sanitizeProgress(JSON.parse(JSON.stringify(state)),ids),state);
 assert.deepEqual(sanitizeProgress({completed:[ids[3]],results:{[ids[0]]:{correct:99}},reviews:{x:-1}},ids),emptyProgress());
});
test('Answers accept tone numbers, whitespace and Unicode tone marks',()=>{
 assert.ok(matchesAnswer(' NI3 HAO3 ',['nǐ hǎo','ni3 hao3']));assert.ok(matchesAnswer('ni\u030c',['nǐ']));assert.ok(!matchesAnswer('ni',['nǐ','ni3']));
});
test('Learning day uses the local calendar date',()=>assert.equal(localDay(new Date(2026,9,27,23,59)),'2026-10-27'));
