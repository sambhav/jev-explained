const {test}=require('node:test');
const assert=require('node:assert/strict');
const {requestPlan,agentSteps,architecture}=require('../walkthroughs.js');
test('independent questions share one round; no selected questions make no requests',()=>{
 assert.equal(requestPlan(['intent','duplicate','urgency'],false).rounds,1);
 assert.equal(requestPlan([],true).rounds,0);
});
test('new evidence only adds a model round when an earlier request exists',()=>{
 assert.deepEqual(requestPlan(['duplicate'],true),{needsFetch:true,first:[],rounds:1});
 assert.deepEqual(requestPlan(['urgency','duplicate'],true),{needsFetch:true,first:['urgency'],rounds:2});
 assert.deepEqual(requestPlan(['urgency'],true),{needsFetch:false,first:['urgency'],rounds:1});
});
test('pending and unauthorized cases never claim a refund',()=>{
 for(const scenario of ['uncertain','blocked']){
  const steps=agentSteps(scenario);
  assert.match(steps[3][3],/not called/);
  assert.doesNotMatch(steps[4][3],/has been refunded/);
 }
});
test('tool failure prevents the success response even after eligibility passes',()=>{
 const failed=agentSteps('failed');
 assert.match(failed[2][3],/call refund tool/);
 assert.match(failed[3][3],/failed/);
 assert.doesNotMatch(failed[4][3],/has been refunded/);
 assert.match(agentSteps('clear')[4][3],/has been refunded/);
});
test('architecture describes both complete answers in the same output stage',()=>{
 assert.equal(architecture.length,4);
 assert.match(architecture[2][1],/Both complete answers/);
});
