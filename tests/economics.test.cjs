const test=require('node:test');
const assert=require('node:assert/strict');
const {calculate}=require('../economics.js');
const p={volume:100000,rounds:6,tokens:2000,output:120,llmIn:1,llmOut:5,jevIn:.042,commonCost:.01,llmMs:2500,jevMs:250,commonMs:2000,fallback:.1};
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);
test('default workflow includes common costs and sequential fallback',()=>{const r=calculate(p);close(r.baselineCost,2560);close(r.hybridCost,1206.4);close(r.baselineTime,17000);close(r.hybridTime,5000);});
test('100% fallback pays both models and takes longer',()=>{const r=calculate({...p,fallback:1});assert.ok(r.hybridCost>r.baselineCost);assert.ok(r.hybridTime>r.baselineTime);close(r.hybridCost-r.baselineCost,r.jevCost);});
test('zero fallback avoids all fallback costs',()=>{const r=calculate({...p,fallback:0});close(r.fallbackCost,0);close(r.hybridTime,3500);});
test('zero volume never produces invalid costs',()=>{const r=calculate({...p,volume:0});close(r.hybridCost,0);close(r.baselineCost,0);});
test('fast LLM baseline can beat Jev on latency',()=>{const r=calculate({...p,llmMs:200});assert.ok(r.hybridTime>r.baselineTime);});
test('shared delay reduces workflow speedup',()=>{const a=calculate({...p,commonMs:0}),b=calculate({...p,commonMs:20000});assert.ok(a.baselineTime/a.hybridTime>b.baselineTime/b.hybridTime);});
test('free LLM input and output has no cost break-even',()=>{const r=calculate({...p,llmIn:0,llmOut:0});assert.equal(r.costBreakEven,null);assert.ok(Number.isFinite(r.hybridCost));});
test('break-even fallback equalizes modeled costs',()=>{const first=calculate(p);const r=calculate({...p,fallback:first.costBreakEven});close(r.baselineCost,r.hybridCost);});
test('HTML numeric defaults satisfy their min, max and step constraints',()=>{
 const html=require('node:fs').readFileSync(require('node:path').join(__dirname,'../economics.html'),'utf8');
 for(const tag of html.match(/<input[^>]+type="number"[^>]*>/g)){
  const attrs=Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  const value=+attrs.value,min=+attrs.min,max=+attrs.max,step=+attrs.step;
  assert.ok(value>=min&&value<=max,attrs.id+' default outside range');
  close((value-min)/step,Math.round((value-min)/step));
 }
});
