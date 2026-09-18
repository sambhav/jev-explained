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
      const s=$('agent-scenario').value, uncertain=s==='uncertain', blocked=s==='blocked', canAct=!uncertain&&!blocked;
      const stages=[
        ['TOOLS + APPLICATION','Collect the facts','Fetch the customer’s payment record. Give the model the message and relevant evidence; it should not invent what the ledger contains.',`Customer: “You charged me twice.”|Ledger: ${uncertain?'one settled charge; one pending authorization':'two settled charges for the same order'}|Permission: ${blocked?'read only':'refunds permitted within account limits'}`],
        ['JEV · ILLUSTRATIVE OUTPUT','Ask narrow questions together','Identify the intent and judge whether the evidence supports a duplicate-charge request. The questions share the same record; neither depends on the other’s answer.',`Choice: refund request · 97%|Noul: evidence supports duplicate · ${uncertain?'54%':'96%'}|Decision threshold for this demo: 90%`],
        ['DETERMINISTIC CODE',uncertain?'Gather more evidence':blocked?'Stop at the permission boundary':'Validate the proposed action',uncertain?'The evidence is below the policy threshold. Fetch settlement status or ask a person to review; do not issue a refund yet.':blocked?'A confident model result does not grant refund permission. Hand the case to an authorized operator.':'Check the refund limit, customer consent, duplicate-refund protection and permission before calling the tool.',`Evidence check: ${uncertain?'needs review':'passed'}|Permission check: ${blocked?'blocked':'passed'}|Route: ${canAct?'refund tool':'review queue'}`],
        ['TOOLS + APPLICATION',canAct?'Execute once; verify the result':'Create a review task',canAct?'Use an idempotency key to avoid issuing the refund twice. Read the tool receipt before marking the operation complete.':'Record the evidence and reason for escalation. The agent has advanced the case without claiming that money was refunded.',canAct?'Refund tool: succeeded|Receipt: refund_demo_001|State: refund confirmed':'Review ticket: created|Refund tool: not called|State: awaiting review'],
        ['GENERATIVE LLM',canAct?'Write the customer’s response':'Explain the next step',canAct?'A language model can write a natural reply grounded in the verified receipt. Jev did not need to generate that text.':'A language model explains that the case is being checked. It must not claim the refund is complete.',canAct?'“The duplicate charge has been refunded.”|Claim grounded in: tool receipt':'“We’re checking the charge and will follow up.”|Claim grounded in: review ticket']
      ];
      const [owner,title,copy,evidence]=stages[step];
      $('agent-owner').textContent=owner; $('agent-title').textContent=title; $('agent-copy').textContent=copy;
      $('agent-evidence').replaceChildren(...evidence.split('|').map(t=>{const el=document.createElement('div');el.className='evidence-item';el.textContent=t;return el;}));
      document.querySelectorAll('[data-agent-stage]').forEach(el=>el.classList.toggle('active',+el.dataset.agentStage===step));
      $('agent-prev').disabled=step===0; $('agent-next').disabled=step===4;
      $('agent-status').textContent=`Step ${step+1} of 5 · ${$('agent-scenario').selectedOptions[0].textContent}`;
    }
    $('agent-next').addEventListener('click',()=>{step=Math.min(4,step+1);render();});
    $('agent-prev').addEventListener('click',()=>{step=Math.max(0,step-1);render();});
    $('agent-reset').addEventListener('click',()=>{step=0;render();});
    $('agent-scenario').addEventListener('change',()=>{step=0;render();}); render();
  }
  if ($('architecture-lab')) {
    let step=0;
    const stages=[
      ['Start with the same problem','Both systems receive the ticket and defined questions. There is still real language understanding to do.'],
      ['Process the input','The generative model builds contextual representations during prefill. Jev also has to evaluate the state; its exact internal computation is not disclosed.'],
      ['The output paths diverge','The LLM starts producing a structured answer one token at a time. TypeSafe describes Jev returning the independent judgments together, without that text-generation loop.'],
      ['Generation continues','The next output token depends on the previous output. Jev’s illustrated answer is already available to the application. This animation is conceptual, not a measured race.'],
      ['Your code decides what to do','Both paths can feed the same application policy. Jev’s specialization may reduce the work needed to get there; correctness and end-to-end latency still need evaluation.']
    ];
    function render(){
      $('arch-count').textContent=`STEP ${step+1} OF 5`; $('arch-title').textContent=stages[step][0];$('arch-copy').textContent=stages[step][1];
      document.querySelectorAll('[data-arch=read]').forEach(el=>el.classList.toggle('active',step>=1));
      document.querySelectorAll('#decode-tokens span').forEach((el,i)=>el.classList.toggle('shown',step===4 || (step===3&&i<3) || (step===2&&i===0)));
      $('parallel-answers').classList.toggle('active',step>=2);
      document.querySelector('[data-arch=direct]').classList.toggle('active',step>=2);
      document.querySelector('[data-arch=parse]').classList.toggle('active',step>=4);
      $('arch-prev').disabled=step===0;$('arch-next').disabled=step===4;
    }
    $('arch-next').addEventListener('click',()=>{step=Math.min(4,step+1);render();});$('arch-prev').addEventListener('click',()=>{step=Math.max(0,step-1);render();});$('arch-reset').addEventListener('click',()=>{step=0;render();});render();
  }
  document.querySelectorAll('[data-embed]').forEach(button=>button.addEventListener('click',()=>{
    const holder=button.closest('.embed'), iframe=document.createElement('iframe');
    iframe.src=button.dataset.embed;iframe.title=button.dataset.title;iframe.allow='fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';holder.replaceChildren(iframe);
  }));
})();
