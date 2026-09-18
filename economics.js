/* Pure model exported for arithmetic tests; UI only runs in a browser. */
(function(root){
 'use strict';
 function calculate(p){
  const llmRequest=(p.tokens*p.llmIn+p.output*p.llmOut)/1e6;
  const jevRequest=p.tokens*p.jevIn/1e6;
  const baselineCost=p.volume*(p.rounds*llmRequest+p.commonCost);
  const jevCost=p.volume*p.rounds*jevRequest;
  const fallbackCost=p.volume*p.rounds*p.fallback*llmRequest;
  const sharedCost=p.volume*p.commonCost;
  return {baselineCost,hybridCost:jevCost+fallbackCost+sharedCost,jevCost,fallbackCost,sharedCost,
   baselineTime:p.rounds*p.llmMs+p.commonMs,
   hybridTime:p.rounds*(p.jevMs+p.fallback*p.llmMs)+p.commonMs,
   costBreakEven:llmRequest>0?1-jevRequest/llmRequest:null,
   timeBreakEven:1-p.jevMs/p.llmMs};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={calculate};
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id);
 const keys={volume:'volume',rounds:'rounds',tokens:'tokens',output:'output',llmIn:'llm-in',llmOut:'llm-out',jevIn:'jev-in',commonCost:'common-cost',llmMs:'llm-ms',jevMs:'jev-ms',commonMs:'common-ms',fallback:'fallback'};
 const base={volume:100000,rounds:6,tokens:2000,output:120,llmIn:1,llmOut:5,jevIn:.042,commonCost:.01,llmMs:2500,jevMs:250,commonMs:2000,fallback:10};
 const presets={interactive:base,bulk:{...base,volume:1000000,rounds:1,commonCost:0,commonMs:0,fallback:5},tools:{...base,rounds:2,commonMs:20000},fast:{...base,llmIn:.15,llmOut:.6,llmMs:200,output:15,commonCost:0,fallback:20}};
 const money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2});
 const time=n=>(n/1000).toFixed(2)+' s';let result,timer;
 function stop(){clearTimeout(timer);['race-llm','race-jev'].forEach(id=>{$(id).className='';});$('race-play').disabled=false;$('race-status').textContent='';}
 function render(){
  stop();const p={};let valid=true;
  for(const [key,id] of Object.entries(keys)){const input=$(id);if(!input.checkValidity()||input.value==='')valid=false;p[key]=Number(input.value);}
  if(!valid){$('input-error').textContent='Enter a number within each field’s allowed range to update the estimate.';$('race-play').disabled=true;return;}
  $('input-error').textContent='';$('fallback-value').textContent=p.fallback+'%';p.fallback/=100;result=calculate(p);
  $('baseline-cost').textContent=money(result.baselineCost);$('hybrid-cost').textContent=money(result.hybridCost);
  const savings=result.baselineCost-result.hybridCost;
  $('savings-label').textContent=savings>=0?'Monthly savings':'Additional monthly cost';$('cost-savings').textContent=money(Math.abs(savings));
  $('baseline-time').textContent=time(result.baselineTime);$('hybrid-time').textContent=time(result.hybridTime);
  const speedup=result.baselineTime/result.hybridTime;
  $('latency-summary').textContent=speedup>=1?`${time(result.baselineTime)} → ${time(result.hybridTime)} expected workflow time · ${speedup.toFixed(2)}× faster.`:`${time(result.baselineTime)} → ${time(result.hybridTime)} expected workflow time · ${(1/speedup).toFixed(2)}× slower.`;
  const costLimit=result.costBreakEven;
  $('limit-summary').textContent=costLimit===null?'The LLM decision price is zero: Jev cannot reduce that spend.':costLimit<=0?'At these prices, Jev’s decision request already costs at least as much as the LLM’s, before fallback.':`Model-cost savings disappear at roughly ${(costLimit*100).toFixed(1)}% fallback. Shared spend reduces the percentage saving.`;
  const parts=[result.jevCost,result.fallbackCost,result.sharedCost],total=result.hybridCost;
  document.querySelectorAll('#cost-stack span').forEach((el,i)=>{el.style.width=(total?parts[i]/total*100:0)+'%';});
  $('cost-breakdown').textContent=`${money(result.jevCost)} Jev + ${money(result.fallbackCost)} fallback + ${money(result.sharedCost)} shared spend per month.`;
  $('economics-takeaway').textContent=savings>0&&speedup>1?'With these inputs, the Jev-first path has lower modeled cost and expected latency. This calculation does not measure decision quality.':'With these inputs, the Jev-first path does not reduce both cost and expected latency. Extra calls and other workflow costs determine the result.';
  $('economics-takeaway').classList.toggle('review',!(savings>0&&speedup>1));
 }
 Object.values(keys).forEach(id=>$(id).addEventListener('input',()=>{document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));render();}));
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{for(const [key,id] of Object.entries(keys))$(id).value=presets[b.dataset.preset][key];document.querySelectorAll('[data-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
 $('race-reset').addEventListener('click',stop);
 $('race-play').addEventListener('click',()=>{
  stop();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){['race-llm','race-jev'].forEach(id=>$(id).className='finished');$('race-status').textContent='Final values shown · reduced motion enabled.';return;}
  const scale=Math.max(1,Math.max(result.baselineTime,result.hybridTime)/8000);
  [['race-llm',result.baselineTime],['race-jev',result.hybridTime]].forEach(([id,duration])=>{$(id).style.setProperty('--duration',duration/scale+'ms');void $(id).offsetWidth;$(id).className='running';});
  $('race-play').disabled=true;$('race-status').textContent=`Illustrative playback · ${scale.toFixed(1)}× time compression.`;
  timer=setTimeout(()=>{$('race-play').disabled=false;$('race-status').textContent='Simulation complete. These are calculated expected times, not observed runs.';},Math.max(result.baselineTime,result.hybridTime)/scale);
 });render();
})(typeof globalThis==='undefined'?this:globalThis);
