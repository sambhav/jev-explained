/* Illustrative values only. No model calls or measured timing. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const answers = {
    noul: {type:'NOUL · YES / NO', question:'Does the message describe an outage?', labels:['Outage'], values:[.96], value:'0.96', explanation:'A value near 1 expresses a strong yes judgment. It still needs validation against real incidents.', rule:'If outage ≥ 0.90, open an incident review.'},
    choice: {type:'CHOICE · OPTIONS YOU DEFINE', question:'Which team should handle this?', labels:['Checkout','Billing','Identity','Other'], values:[.92,.05,.01,.02], value:'Checkout', explanation:'Checkout has the highest probability: 92%. The other options remain visible, so code can use the whole distribution.', rule:'If the winning probability is below 80%, ask for triage.'},
    score: {type:'SCORE · AN ORDERED RUBRIC', question:'How severe is this incident?', labels:['0 · Routine','1 · Important','2 · Urgent','3 · Critical'], values:[.01,.02,.13,.84], value:'2.80 / 3', explanation:'0 × 1% + 1 × 2% + 2 × 13% + 3 × 84% = 2.80. The score averages rubric positions; it is not a 93% probability of being critical.', rule:'If severity ≥ 2.5, put this in the priority review queue.'}
  };
  function showAnswer(key) {
    const a = answers[key];
    $('answer-type').textContent=a.type; $('answer-question').textContent=a.question;
    $('answer-value').textContent=a.value; $('answer-explanation').textContent=a.explanation; $('answer-rule').textContent=a.rule;
    $('answer-chart').replaceChildren(...a.labels.map((label,i)=>{
      const row=document.createElement('div'); row.className='prob-row';
      const name=document.createElement('span'); name.textContent=label;
      const track=document.createElement('div'); track.className='track';
      const bar=document.createElement('span'); bar.style.width=a.values[i]*100+'%'; track.append(bar);
      const value=document.createElement('output'); value.textContent=Math.round(a.values[i]*100)+'%';
      row.append(name,track,value); return row;
    }));
    document.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.answer===key)));
  }
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>showAnswer(b.dataset.answer)));
  showAnswer('noul');
  const names={intent:'Refund request?',duplicate:'Two settled charges?',urgency:'Urgent?'};
  function renderPlan() {
    const selected=[...document.querySelectorAll('[data-check]:checked')].map(el=>el.dataset.check);
    const needsFetch=document.querySelector('[name="record-source"]:checked').value==='fetch' && selected.includes('duplicate');
    // Fetching is gated on the intent judgment in this teaching workflow.
    const first=needsFetch?[...new Set(['intent',...selected.filter(k=>k!=='duplicate')])]:selected;
    const rounds=selected.length ? (needsFetch?2:1):0;
    const board=$('dependency-board'); board.replaceChildren();
    function stage(label,items,kind) {
      const group=document.createElement('div'); group.className='workflow-stage '+kind;
      const title=document.createElement('p'); title.className='label'; title.textContent=label;
      const nodes=document.createElement('div'); nodes.className='workflow-nodes';
      items.forEach(text=>{const node=document.createElement('div');node.className='workflow-node';node.textContent=text;nodes.append(node);});
      group.append(title,nodes);board.append(group);
    }
    stage('AVAILABLE INPUT',[needsFetch?'Customer message':'Customer message + payment record'],'input-stage');
    if(rounds) stage('MODEL REQUEST 1 · QUESTIONS RUN TOGETHER',first.map(k=>names[k]+(needsFetch&&k==='intent'&&!selected.includes('intent')?' (needed before lookup)':'')),'model-stage');
    if(needsFetch) {
      stage('TOOL CALL · AFTER REFUND INTENT IS IDENTIFIED',['Fetch payment record'],'tool-stage');
      stage('MODEL REQUEST 2 · USES THE NEW RECORD',[names.duplicate],'model-stage');
    }
    stage('APPLICATION CODE',[rounds?'Apply policy; act or request review':'No model judgments selected'],'policy-stage');
    $('dependency-count').textContent=rounds+' model request round'+(rounds===1?'':'s');
    $('dependency-explanation').textContent=needsFetch?'The duplicate-charge question must wait for the payment record. Adding it creates a second model round. Intent and urgency can share the first request.':rounds?'All selected questions use the same evidence. Adding another independent question does not add a model request round. It may still affect processing time and cost.':'Select a question to add a model request. The application still needs a policy for handling the case.';
  }
  document.querySelectorAll('[data-check], [name="record-source"]').forEach(el=>el.addEventListener('change',renderPlan));renderPlan();
})();
