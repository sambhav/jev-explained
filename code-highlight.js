/* Syntax highlighting for pseudo-Python examples. Uses highlight.js when available. */
(function(){
  function classify(pre){
    if(pre.querySelector('code')) return;
    const text=pre.textContent;
    const code=document.createElement('code');
    // Most examples intentionally use Python-like pseudocode; JSON-only examples are detected separately.
    const trimmed=text.trim();
    let lang=/^SELECT\b/i.test(trimmed)?'language-sql':'language-python';
    if((trimmed.startsWith('{')||trimmed.startsWith('[')) && /"[^"\n]+"\s*:/.test(trimmed)) lang='language-json';
    code.className=lang;
    code.textContent=text;
    pre.textContent='';pre.appendChild(code);
  }
  document.querySelectorAll('pre').forEach(classify);
  if(window.hljs) document.querySelectorAll('pre code').forEach(el=>window.hljs.highlightElement(el));
})();