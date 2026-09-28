/* Theme switch and the launch-day story strip. No analytics, network calls or required storage. */
(() => {
  'use strict';
  const root = document.documentElement, $ = id => document.getElementById(id);

  const themeButton = $('theme-button');
  const syncTheme = () => themeButton.setAttribute('aria-label', root.classList.contains('light') ? 'Switch to dark theme' : 'Switch to light theme');
  themeButton.addEventListener('click', () => {
    root.classList.toggle('light');
    try { localStorage.setItem('jev-explained-theme', root.classList.contains('light') ? 'light' : 'dark'); } catch (e) { /* optional */ }
    syncTheme();
  });
  syncTheme();

  const checkout = '“Nobody can complete checkout. Every payment fails, and our launch starts in two hours.”';
  const refund = '“Two charges appeared for my order. Please refund the duplicate.”';
  const judged = [['Outage?', '0.96'], ['Team', 'Checkout · 92%'], ['Severity', '2.80 / 3']];
  const states = {
    intro:   {status: 'LAUNCH DAY: queue filling', time: '10:04', quote: checkout, rows: [], ending: null},
    halves:  {status: 'LAUNCH DAY: queue filling', time: '10:04', quote: checkout, rows: [['Team', 'Checkout · 92%']], ending: null},
    answers: {status: 'LAUNCH DAY: three decisions', time: '10:04', quote: checkout, rows: judged, ending: null},
    how:     {status: 'LAUNCH DAY: three decisions', time: '10:04', quote: checkout, rows: judged, ending: ['green', 'Routed to Checkout · priority review']},
    agent:   {status: 'LAUNCH DAY: refund request', time: '10:19', quote: refund, rows: [['Intent', 'Refund · 97%'], ['Ledger', 'Two settled charges'], ['Permission', 'Refunds allowed']], ending: ['green', 'Refunded £24 · receipt checked']},
    done:    {status: 'QUEUE CLEAR', time: '10:21', quote: null, rows: [['10:04 · Checkout down', 'Routed'], ['10:19 · Duplicate charge', 'Refunded']], ending: ['green', 'Every decision checked in code'], resolved: true}
  };
  const chapterState = {intro: 'intro', halves: 'halves', answers: 'answers', how: 'how', agent: 'agent', evidence: 'done', cost: 'done', elsewhere: 'done', limits: 'done', back: 'done'};

  const strip = $('story-strip');
  let current = null;
  function show(key) {
    if (key === current) return;
    current = key;
    const s = states[key];
    $('story-status').textContent = s.status;
    $('story-time').textContent = s.time;
    $('story-mobile-label').textContent = `${s.status} · ${s.time}`;
    $('story-badge').classList.toggle('resolved', !!s.resolved);
    strip.classList.toggle('resolved-state', !!s.resolved);
    const quote = $('story-quote');
    quote.hidden = !s.quote;
    if (s.quote) quote.textContent = s.quote;
    $('story-judgments').replaceChildren(...s.rows.map(([k, v]) => {
      const row = document.createElement('span'), value = document.createElement('b');
      row.textContent = k; value.textContent = v; row.append(value); return row;
    }));
    const ending = $('story-ending');
    if (s.ending) {
      const line = document.createElement('span');
      line.className = s.ending[0]; line.textContent = s.ending[1];
      ending.replaceChildren(line);
    } else {
      const cursor = document.createElement('span');
      cursor.className = 'cursor'; cursor.textContent = '…';
      ending.replaceChildren(cursor);
    }
  }

  // The active chapter is the last section whose top has crossed the upper third of the viewport.
  const sections = [...document.querySelectorAll('[data-chapter]')];
  let queued = false;
  function update() {
    queued = false;
    const line = innerHeight * .35;
    let active = sections[0];
    for (const section of sections) if (section.getBoundingClientRect().top <= line) active = section;
    show(chapterState[active.dataset.chapter] || 'intro');
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  update();

  const toggle = $('story-toggle');
  toggle.addEventListener('click', () => {
    const open = !strip.classList.contains('story-open');
    strip.classList.toggle('story-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  strip.addEventListener('keydown', e => { if (e.key === 'Escape') { strip.classList.remove('story-open'); toggle.setAttribute('aria-expanded', 'false'); } });
})();
