/* Rounded labels transcribed from https://evals.typesafe.ai/ on 2026-09-18.
 * Four-workflow equally weighted means; workflow mode; provider-default reasoning.
 * Agreement is with model-generated reference labels, not human ground truth.
 */
(() => {
 'use strict';
 const rows=[
  {name:'Jev',accuracy:67.8,seconds:.4,cost:.0004},
  {name:'haiku 4.5',accuracy:53.6,seconds:12.5,cost:.0195},
  {name:'opus 5',accuracy:73.1,seconds:37.8,cost:.1761},
  {name:'sonnet 5',accuracy:67.8,seconds:78.1,cost:.1174},
  {name:'DS v4 flash',accuracy:64.4,seconds:51.9,cost:.0059},
  {name:'DS v4 pro',accuracy:65.5,seconds:86.5,cost:.0413},
  {name:'luna',accuracy:66.8,seconds:12.9,cost:.0033},
  {name:'sol',accuracy:74.1,seconds:23.3,cost:.0836},
  {name:'terra',accuracy:67.9,seconds:10.1,cost:.0304}
 ];
 const $=id=>document.getElementById(id); let metric='seconds';
 const format=(n,key)=>key==='accuracy'?n.toFixed(1)+'%':key==='cost'?'$'+n.toFixed(4):n.toFixed(1)+' s';
 $('benchmark-model').innerHTML=rows.slice(1).map(r=>`<option value="${r.name}">${r.name}</option>`).join('');$('benchmark-model').value='terra';
 $('benchmark-table').innerHTML=rows.map(r=>`<tr><th scope="row">${r.name}</th><td>${format(r.accuracy,'accuracy')}</td><td>${format(r.seconds,'seconds')}</td><td>${format(r.cost,'cost')}</td></tr>`).join('');
 function render(){
  const max=metric==='accuracy'?100:Math.max(...rows.map(r=>r[metric]));
  $('benchmark-caption').textContent={seconds:'Elapsed time per workflow · seconds · lower is better',cost:'API cost per workflow · USD · lower is better',accuracy:'Agreement with reference answers · percent · higher is better'}[metric];
  $('benchmark-chart').innerHTML=rows.map(r=>`<div class="bench-row ${r.name==='Jev'?'jev':''}"><span>${r.name}</span><div class="track"><span style="width:${r[metric]/max*100}%"></span></div><output>${format(r[metric],metric)}</output></div>`).join('');
  $('benchmark-chart').setAttribute('aria-label',$('benchmark-caption').textContent+'. '+rows.map(r=>r.name+': '+format(r[metric],metric)).join('; '));
  const other=rows.find(r=>r.name===$('benchmark-model').value), jev=rows[0],diff=jev.accuracy-other.accuracy;
  $('benchmark-summary').textContent=`Against ${other.name}: Jev is approximately ${(other.seconds/jev.seconds).toFixed(1)}× faster and ${(other.cost/jev.cost).toFixed(1)}× cheaper in this snapshot; reference agreement is ${Math.abs(diff)<0.05?'equal at displayed precision':Math.abs(diff).toFixed(1)+' percentage points '+(diff>0?'higher':'lower')}.`;
  document.querySelectorAll('[data-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metric===metric)));
 }
 document.querySelectorAll('[data-metric]').forEach(b=>b.addEventListener('click',()=>{metric=b.dataset.metric;render();}));$('benchmark-model').addEventListener('change',render);render();
})();
