/* Deterministic teaching demos. No credentials, model requests or analytics. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => { if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page'); });
  const tickets = {
    outage: {text:'“Nobody can complete checkout. Every payment fails, and our launch starts in two hours.”', values:[.92,.05,.01,.02]},
    ambiguous: {text:'“Something went wrong with my account and I may have been charged. Can you look into it?”', values:[.09,.46,.40,.05]},
    billing: {text:'“Could you send a copy of last month’s invoice? Everything is working fine.”', values:[.01,.96,.01,.02]}
  };
  if ($('ticket-lab')) {
    let chosen = 'outage';
    const labels = ['Checkout','Billing','Identity','Other'];
    $('ticket-bars').innerHTML = labels.map((name,i)=>`<div class="prob-row"><span>${name}</span><div class="track"><span id="ticket-bar-${i}"></span></div><output id="ticket-prob-${i}"></output></div>`).join('');
    function render() {
      const {text,values} = tickets[chosen], threshold = +$('ticket-threshold').value / 100;
      $('ticket-text').textContent = text;
      values.forEach((v,i) => { $('ticket-bar-'+i).style.width = v*100+'%'; $('ticket-prob-'+i).textContent = Math.round(v*100)+'%'; });
      const top = Math.max(...values), winner = labels[values.indexOf(top)], auto = top >= threshold;
      $('ticket-threshold-value').textContent = Math.round(threshold*100)+'%';
      $('ticket-action').textContent = auto ? `Route to ${winner} · ${Math.round(top*100)}% meets your ${Math.round(threshold*100)}% threshold.` : `Ask a human to triage · ${winner} leads at ${Math.round(top*100)}%, below your ${Math.round(threshold*100)}% threshold.`;
      $('ticket-action').classList.toggle('review',!auto);
      document.querySelectorAll('[data-ticket]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ticket === chosen)));
    }
    document.querySelectorAll('[data-ticket]').forEach(b=>b.addEventListener('click',()=>{chosen=b.dataset.ticket;render();}));
    $('ticket-threshold').addEventListener('input',render); render();
  }
  if ($('agent-lab')) {
    let step=0;
    function render() {
      const stages=JevWalkthroughs.agentSteps($('agent-scenario').value);
      const [owner,title,copy,evidence]=stages[step];
      $('agent-owner').textContent=owner; $('agent-title').textContent=title; $('agent-copy').textContent=copy;
      $('agent-evidence').replaceChildren(...evidence.split('|').map(t=>{const el=document.createElement('div');el.className='evidence-item';el.textContent=t;return el;}));
      document.querySelectorAll('[data-agent-stage]').forEach(el=>{const active=+el.dataset.agentStage===step;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
      $('agent-prev').disabled=step===0; $('agent-next').disabled=step===4;
      $('agent-status').textContent=`Step ${step+1} of 5 · ${$('agent-scenario').selectedOptions[0].textContent}`;
    }
    $('agent-next').addEventListener('click',()=>{step=Math.min(4,step+1);render();});
    $('agent-prev').addEventListener('click',()=>{step=Math.max(0,step-1);render();});
    $('agent-reset').addEventListener('click',()=>{step=0;render();});
    $('agent-scenario').addEventListener('change',()=>{step=0;render();});
    document.querySelectorAll('[data-agent-stage]').forEach(el=>el.addEventListener('click',()=>{step=+el.dataset.agentStage;render();})); render();
  }
  if ($('architecture-lab')) {
    let step=0;
    const stages=JevWalkthroughs.architecture;
    function render(){
      $('arch-count').textContent=`STAGE ${step+1} OF 4`; $('arch-title').textContent=stages[step][0];$('arch-copy').textContent=stages[step][1];
      document.querySelectorAll('[data-arch=read]').forEach(el=>el.classList.toggle('active',step>=1));
      document.querySelectorAll('#decode-tokens span').forEach((el,i)=>el.classList.toggle('shown',step>=2));
      $('parallel-answers').classList.toggle('active',step>=2);
      document.querySelector('[data-arch=direct]').classList.toggle('active',step>=3);
      document.querySelector('[data-arch=parse]').classList.toggle('active',step>=3);
      $('arch-policy').hidden=step!==3; $('arch-progress').textContent=`Stage ${step+1} of 4`;
      $('arch-prev').disabled=step===0;$('arch-next').disabled=step===3;
    }
    $('arch-next').addEventListener('click',()=>{step=Math.min(3,step+1);render();});$('arch-prev').addEventListener('click',()=>{step=Math.max(0,step-1);render();});$('arch-reset').addEventListener('click',()=>{step=0;render();});render();
  }
  document.querySelectorAll('[data-embed]').forEach(button=>button.addEventListener('click',()=>{
    const holder=button.closest('.embed'), iframe=document.createElement('iframe');
    iframe.src=button.dataset.embed;iframe.title=button.dataset.title;iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';holder.replaceChildren(iframe);
  }));
})();
