/* Local D3 7.9: responsive case-study diagrams; animations show direction of work. */
(function () {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const C={card:'#142235',text:'#f3f6fc',muted:'#aeb8cc',line:'#34516a',accent:'#87c4ff',green:'#8fe0bb'};
 let sequence=0;
 function draw(sel,kind){
  const host=document.querySelector(sel);if(!host)return;
  const descriptions={search:'Retrieve candidates, score relevance, then sort in code.',browser:'Observe the page, choose an action, enforce policy, execute, and observe again.',game:'Read game state, choose a legal action, execute in the engine, and read the updated state.'};
  function render(){
   const w=Math.max(240,host.clientWidth-24),mobile=w<650,h=mobile?470:330;
   const root=d3.select(host);root.selectAll('svg').remove();
   const svg=root.insert('svg',':first-child').attr('viewBox',`0 0 ${w} ${h}`).attr('role','img').attr('aria-label',descriptions[kind]).style('width','100%').style('height','auto');
   svg.append('title').text(descriptions[kind]);const id='arrow-'+sequence++;
   svg.append('defs').append('marker').attr('id',id).attr('viewBox','0 0 10 10').attr('refX',9).attr('refY',5).attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto').append('path').attr('d','M0 0L10 5L0 10z').attr('fill',C.accent);
   const labels=kind==='search'?[['Retrieve','Millions → 50 candidates'],['Jev Score','Relevance against a rubric'],['Sort in code','Rank the candidate set'],['Show results','Return the useful matches']]:kind==='browser'?[['Observe page','Current text + controls'],['Jev Choice','Operation + compatible target'],['Policy + execute','Validate, then use the browser'],['Observe again','Did the action work?']]:[['Read game state','Health, enemies, legal actions'],['Jev Choice','Choose a suitable action'],['Game engine','Apply rules and execute'],['Updated world','Observe what changed']];
   const positions=mobile?labels.map((_,i)=>({x:15,y:15+i*108,w:w-30,h:70})):labels.map((_,i)=>({x:i%2*(w/2)+20,y:20+Math.floor(i/2)*160,w:w/2-40,h:90}));
   // Desktop order follows top-left, top-right, bottom-right, bottom-left.
   if(!mobile)[positions[2],positions[3]]=[positions[3],positions[2]];
   labels.forEach(([title,sub],i)=>{const p=positions[i],g=svg.append('g');g.append('rect').attr('x',p.x).attr('y',p.y).attr('width',p.w).attr('height',p.h).attr('rx',12).attr('fill',C.card).attr('stroke',i===1?C.green:C.line);g.append('text').attr('x',p.x+16).attr('y',p.y+29).attr('fill',i===1?C.green:C.text).attr('font-size',14).attr('font-weight',700).text(`${i+1}. ${title}`);g.append('text').attr('x',p.x+16).attr('y',p.y+51).attr('fill',C.muted).attr('font-size',11).text(sub);});
   const edge=(a,b)=>{if(mobile)return `M${a.x+a.w/2},${a.y+a.h}L${b.x+b.w/2},${b.y-3}`;if(a.y===b.y)return a.x<b.x?`M${a.x+a.w},${a.y+45}L${b.x-3},${b.y+45}`:`M${a.x},${a.y+45}L${b.x+b.w+3},${b.y+45}`;return `M${a.x+a.w/2},${a.y+a.h}L${b.x+b.w/2},${b.y-3}`;};
   positions.slice(0,-1).forEach((p,i)=>{const line=svg.append('path').attr('d',edge(p,positions[i+1])).attr('fill','none').attr('stroke',C.accent).attr('stroke-width',2).attr('marker-end',`url(#${id})`);if(!reduced){const length=line.node().getTotalLength();line.attr('stroke-dasharray',length).attr('stroke-dashoffset',length).transition().delay(i*400).duration(450).attr('stroke-dashoffset',0);}});
  }
  const button=document.createElement('button');button.textContent='Replay flow';button.addEventListener('click',render);host.appendChild(button);
  render();let width=host.clientWidth;new ResizeObserver(()=>{if(host.clientWidth!==width){width=host.clientWidth;render();}}).observe(host);
 }
 window.JevViz={search:sel=>draw(sel,'search'),browserLoop:sel=>draw(sel,'browser'),gameLoop:sel=>draw(sel,'game')};
})();
