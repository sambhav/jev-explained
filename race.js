/* Side-by-side speed model. Pure estimate exported for tests; the UI animates it.
 * Defaults are illustrative and editable. Jev's latency slope comes from Archer Hume's
 * published sweep (about 87 ms for 1 question, about 610 ms for 1,500 on a short state).
 */
(function(root){
 'use strict';
 const pad = n => String(n).padStart(2, '0');
 const presets = {
  triage: {label: 'Triage a message', questions: 3, stateTokens: 400, optionTokens: 30,
   llm: '{"team":"checkout","urgent":true,"severity":2}',
   jev: [['team', 'Choice', 'checkout · 0.92'], ['urgent', 'Noul', '0.96'], ['severity', 'Score', '2.80 / 3']]},
  criteria: {label: 'Check 21 policy rules', questions: 21, stateTokens: 900, optionTokens: 0,
   llm: '{' + Array.from({length: 21}, (_, i) => `"rule_${pad(i + 1)}":${i === 6 || i === 14 ? 'true' : 'false'}`).join(',') + '}',
   jev: Array.from({length: 21}, (_, i) => [`rule_${pad(i + 1)}`, 'Noul', i === 6 || i === 14 ? '0.91' : '0.0' + (2 + i % 7)])},
  rerank: {label: 'Rerank 50 results', questions: 50, stateTokens: 6000, optionTokens: 0,
   llm: '{' + Array.from({length: 50}, (_, i) => `"doc_${pad(i + 1)}":${[3, 1, 0, 2, 1][i % 5]}`).join(',') + '}',
   jev: Array.from({length: 50}, (_, i) => [`doc_${pad(i + 1)}`, 'Score', ['2.71', '0.94', '0.12', '1.88', '1.05'][i % 5] + ' / 3'])},
  action: {label: 'Pick 1 of 120 page actions', questions: 1, stateTokens: 1500, optionTokens: 1440,
   llm: '{"action":"click #search-flights"}',
   jev: [['action', 'Choice', 'click #search-flights · 0.88']]}
 };
 const defaults = {ttftMs: 400, prefillTps: 8000, decodeTps: 80, reasoningTokens: 0, charsPerToken: 3.5, questionTokens: 25, jevBaseMs: 87, jevPerQuestionMs: 0.35};
 function estimate(key, p = defaults){
  const s = presets[key];
  const inputTokens = s.stateTokens + s.optionTokens + s.questions * p.questionTokens;
  const outputTokens = Math.ceil(s.llm.length / p.charsPerToken);
  const prefillMs = inputTokens / p.prefillTps * 1000;
  const writeMs = p.ttftMs + prefillMs + (p.reasoningTokens + outputTokens) / p.decodeTps * 1000;
  // Reading label probabilities needs the same prefill but no decode loop.
  const readoutMs = p.ttftMs + prefillMs;
  const jevMs = p.jevBaseMs + p.jevPerQuestionMs * (s.questions - 1);
  return {inputTokens, outputTokens, writeMs, readoutMs, jevMs};
 }
 const api = {presets, defaults, estimate};
 if (typeof module !== 'undefined' && module.exports) module.exports = api;
 if (typeof document === 'undefined') return;
 root.JevRace = api;

 const $ = id => document.getElementById(id);
 if (!$('race-lab')) return;
 let key = 'triage', timers = [], frame = 0;
 const fields = {ttftMs: 'rc-ttft', decodeTps: 'rc-decode', reasoningTokens: 'rc-reasoning', prefillTps: 'rc-prefill'};
 const fmt = ms => ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : Math.round(ms) + ' ms';
 function params(){
  const p = {...defaults};
  for (const [k, id] of Object.entries(fields)) { const v = Number($(id).value); if (Number.isFinite(v) && v > 0 || (k === 'reasoningTokens' && v >= 0)) p[k] = v; }
  return p;
 }
 function stop(){ timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(frame); }
 function renderStatic(){
  stop();
  const s = presets[key], r = estimate(key, params());
  $('rc-reasoning-value').textContent = Number($('rc-reasoning').value).toLocaleString('en-US');
  $('race-write-time').textContent = fmt(r.writeMs);
  $('race-readout-time').textContent = fmt(r.readoutMs);
  $('race-jev-time').textContent = fmt(r.jevMs);
  $('race-write-out').textContent = '';
  ['race-readout-out', 'race-jev-out'].forEach(id => $(id).replaceChildren());
  ['race-write-bar', 'race-readout-bar', 'race-jev-bar'].forEach(id => { $(id).style.width = '0%'; });
  $('race-summary').textContent = `${s.questions} question${s.questions === 1 ? '' : 's'} · about ${r.inputTokens.toLocaleString('en-US')} input tokens · the LLM writes about ${(r.outputTokens + params().reasoningTokens).toLocaleString('en-US')} output tokens. Jev is about ${(r.writeMs / r.jevMs).toFixed(0)}× faster than writing JSON and ${(r.readoutMs / r.jevMs).toFixed(1)}× faster than an LLM read-out, under these assumptions.`;
  $('race-play-status').textContent = '';
  document.querySelectorAll('[data-race]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.race === key)));
 }
 function answers(target, list){
  target.replaceChildren(...list.map(([name, type, value]) => { const row = document.createElement('span'); const b = document.createElement('b'); row.textContent = `${name} · ${type}`; b.textContent = value; row.append(b); return row; }));
 }
 function play(){
  renderStatic();
  const s = presets[key], r = estimate(key, params());
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const longest = Math.max(r.writeMs, r.readoutMs, r.jevMs), scale = Math.max(1, longest / 6000);
  $('race-play-status').textContent = scale > 1 ? `Playback compressed ${scale.toFixed(1)}×; times shown are the estimates.` : 'Real-time playback of the estimates.';
  if (reduced) { $('race-write-out').textContent = s.llm; answers($('race-readout-out'), s.jev); answers($('race-jev-out'), s.jev); ['race-write-bar', 'race-readout-bar', 'race-jev-bar'].forEach(id => { $(id).style.width = '100%'; }); return; }
  const start = performance.now(), firstChar = (r.readoutMs) / scale, done = {readout: false, jev: false};
  const tick = now => {
   const t = now - start;
   $('race-write-bar').style.width = Math.min(100, t / (r.writeMs / scale) * 100) + '%';
   $('race-readout-bar').style.width = Math.min(100, t / (r.readoutMs / scale) * 100) + '%';
   $('race-jev-bar').style.width = Math.min(100, t / (r.jevMs / scale) * 100) + '%';
   const writing = (t - firstChar) / ((r.writeMs - r.readoutMs) / scale);
   const reasoningShare = params().reasoningTokens / (params().reasoningTokens + r.outputTokens);
   if (writing > 0 && writing < reasoningShare) $('race-write-out').textContent = '… thinking …';
   else if (writing > 0) $('race-write-out').textContent = s.llm.slice(0, Math.ceil(s.llm.length * Math.min(1, (writing - reasoningShare) / (1 - reasoningShare || 1))));
   if (!done.readout && t >= r.readoutMs / scale) { done.readout = true; answers($('race-readout-out'), s.jev); }
   if (!done.jev && t >= r.jevMs / scale) { done.jev = true; answers($('race-jev-out'), s.jev); }
   if (t < r.writeMs / scale) frame = requestAnimationFrame(tick); else $('race-write-out').textContent = s.llm;
  };
  frame = requestAnimationFrame(tick);
 }
 document.querySelectorAll('[data-race]').forEach(b => b.addEventListener('click', () => { key = b.dataset.race; renderStatic(); }));
 Object.values(fields).forEach(id => $(id).addEventListener('input', renderStatic));
 $('race-go').addEventListener('click', play);
 $('race-reset-btn').addEventListener('click', renderStatic);
 renderStatic();
})(typeof globalThis === 'undefined' ? this : globalThis);
