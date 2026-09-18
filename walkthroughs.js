/* Deterministic teaching cases shared by the page controls and regression tests. */
(function(root){
  'use strict';
  function requestPlan(selected, delayed) {
    const needsFetch=delayed && selected.includes('duplicate');
    const first=needsFetch?selected.filter(k=>k!=='duplicate'):[...selected];
    return {needsFetch,first,rounds:Number(first.length>0)+Number(needsFetch)};
  }
  function agentSteps(scenario) {
    const pending=scenario==='uncertain',blocked=scenario==='blocked',failed=scenario==='failed';
    const eligible=!pending&&!blocked,refunded=eligible&&!failed;
    return [
      ['TOOLS + APPLICATION','Read the message and payment record','The customer explicitly requests a refund. The ledger supplies structured facts; a model does not need to guess how many charges have settled.',`Customer: “Two charges appeared for my order. Please refund the duplicate.”|Ledger: ${pending?'one settled charge; one pending authorization':'two settled charges for the same order'}|Permission: ${blocked?'read only':'refunds allowed'}|Amount: £24; policy limit: £50; no earlier refund`],
      ['JEV · INVENTED OUTPUT','Interpret the request','Choose among refund request, invoice request, payment-status question and other. Here the refund option leads at 97%; the application requires at least 90% to continue automatically. This establishes intent, not refund eligibility.','Choice: refund request · 97%|Other options: invoice 1%; status 1%; other 1%|Application threshold: 90% → intent check passes'],
      ['APPLICATION CODE',pending?'Wait for a settled record':blocked?'Route to an authorized operator':'Check refund eligibility',pending?'The ledger contains only one settled charge. Code routes the case for review; a likely refund intent does not turn a pending authorization into a duplicate payment.':blocked?'The duplicate is confirmed, but this agent cannot issue refunds. Code creates a handoff to an authorized operator.':'The duplicate is settled, the request permits refunding it, the amount is within the limit and no earlier refund exists. Code may now call the refund tool.',`Intent threshold: passed|Two settled charges: ${pending?'no':'yes'}|Permission: ${blocked?'no':'yes'}|Amount and duplicate-refund checks: passed|Next action: ${eligible?'call refund tool':'create review task'}`],
      ['TOOLS + APPLICATION',refunded?'Refund confirmed by the tool':failed?'The refund tool reports failure':'Review task created',refunded?'Send the request with an idempotency key, then check the tool receipt. Only a successful receipt allows the case to be marked refunded.':failed?'The tool returns a temporary service error. Keep the case unresolved and create a review task. A retry would reuse the same idempotency key.':'Save the customer’s request, ledger evidence and reason for review. Do not call the refund tool.',refunded?'Refund tool: succeeded|Receipt: refund_demo_001|Case state: refunded':failed?'Refund tool: failed (temporary error)|Refund receipt: none|Case state: awaiting review':'Refund tool: not called|Review ticket: review_demo_001|Case state: awaiting review'],
      ['GENERATIVE LLM OR TEMPLATE',refunded?'Reply with the confirmed result':'Reply without claiming a refund',refunded?'Use the verified receipt to write the customer’s reply. A fixed template also works for this simple case.':'Use the case state to explain what happens next. Neither a high model probability nor an attempted tool call is proof that a refund happened.',refunded?'“The duplicate £24 charge has been refunded.”|Basis: successful refund receipt':pending?'“One entry is still pending. We’re checking it before issuing a refund.”|Basis: ledger and review ticket':blocked?'“I’ve passed your refund request to an authorized colleague.”|Basis: review ticket':'“The refund could not be completed. Your request has been sent for review.”|Basis: failed tool result and review task']
    ];
  }
  const architecture=[
    ['Define the task','Both paths receive the same ticket, team options and severity rubric. We ask for a team, an urgency judgment and a severity score.'],
    ['Process the input','Both paths must evaluate the supplied evidence. For a generative LLM, input processing is often called prefill. Jev’s exact internals are not published.'],
    ['Produce all three answers','The LLM generates the displayed JSON in sequence. Jev returns three independent judgments. Both complete answers are shown here: their positions on this page do not imply equal start times or measured completion times.'],
    ['Apply the same policy','The application can use either result to route the case and decide whether to prioritize review. Jev exposes probabilities directly; this LLM example requests only the values the policy needs. Accuracy, calibration and time still need separate measurement.']
  ];
  const api={requestPlan,agentSteps,architecture};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.JevWalkthroughs=api;
})(typeof window!=='undefined'?window:this);
