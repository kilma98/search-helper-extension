(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=t(e);fetch(e.href,r)}})();function v(o,n){const t=o.trim();if(!t)return[];const s=`"${t}"`;return{general:[{label:"Exact phrase",query:s,explanation:"Searches for the exact phrase."},{label:"Title focus",query:`intitle:${t}`,explanation:"Prioritizes pages with your terms in the title."},{label:"Less commercial noise",query:`${t} -shop -buy -price`,explanation:"Filters out many shopping-oriented results."},{label:"PDF sources",query:`${s} filetype:pdf`,explanation:"Finds downloadable documents and reports."},{label:"Site overview",query:`${t} site:.org`,explanation:"Focuses on organizations and institutions."}],academic:[{label:"PDF papers",query:`${s} filetype:pdf`,explanation:"Finds PDF studies, papers, and reports."},{label:"University sources",query:`${t} site:.edu`,explanation:"Limits results to university domains."},{label:"Nonprofit sources",query:`${t} site:.org`,explanation:"Finds research from organizations and NGOs."},{label:"Report pages",query:`${t} intitle:report`,explanation:"Looks for report-style pages."},{label:"Study results",query:`${t} study OR research OR publication`,explanation:"Adds academic-style research terms."}],technical:[{label:"GitHub results",query:`${t} site:github.com`,explanation:"Finds repositories and code discussions."},{label:"Stack Overflow",query:`${t} site:stackoverflow.com`,explanation:"Finds implementation discussions and fixes."},{label:"Documentation pages",query:`${t} inurl:docs`,explanation:"Looks for documentation URLs."},{label:"README / guides",query:`${t} readme OR guide OR tutorial`,explanation:"Finds setup guides and walkthroughs."},{label:"Official docs focus",query:`${s} documentation`,explanation:"Pushes results toward documentation pages."}]}[n]}const m=document.querySelector("#app");if(!m)throw new Error("App root not found");m.innerHTML=`
  <main class="container">
    <h1>Search Helper</h1>

    <label class="label" for="query">Search query</label>
    <input
      id="query"
      class="input"
      type="text"
      placeholder="e.g. hydroponics africa"
    />

    <label class="label" for="mode">Mode</label>
    <select id="mode" class="select">
      <option value="general">General</option>
      <option value="academic">Academic</option>
      <option value="technical">Technical</option>
    </select>

    <div class="actions">
      <button id="generate" class="button primary">Generate</button>
      <button id="open-all" class="button secondary">Open all</button>
      <button id="copy-all" class="button secondary">Copy all</button>
    </div>

    <section id="results" class="results"></section>
  </main>
`;const y=document.querySelector("#query"),f=document.querySelector("#mode"),b=document.querySelector("#generate"),g=document.querySelector("#open-all"),h=document.querySelector("#copy-all"),q=document.querySelector("#results");if(!y||!f||!b||!g||!h||!q)throw new Error("Popup elements not found");const x=y,S=f,L=b,w=g,d=h,p=q;let l=[];function E(o){if(p.innerHTML="",o.length===0){p.innerHTML='<p class="empty">Enter a query to get suggestions.</p>';return}for(const n of o){const t=document.createElement("article");t.className="card";const s=document.createElement("h2");s.className="card-title",s.textContent=n.label;const e=document.createElement("p");e.className="card-explanation",e.textContent=n.explanation;const r=document.createElement("code");r.className="card-query",r.textContent=n.query;const a=document.createElement("div");a.className="card-actions";const c=document.createElement("button");c.className="button primary",c.textContent="Open",c.addEventListener("click",()=>{chrome.runtime.sendMessage({action:"openSearch",query:n.query})});const i=document.createElement("button");i.className="button secondary",i.textContent="Copy",i.addEventListener("click",async()=>{await navigator.clipboard.writeText(n.query),i.textContent="Copied",setTimeout(()=>{i.textContent="Copy"},1e3)}),a.append(c,i),t.append(s,e,r,a),p.appendChild(t)}}function u(){const o=x.value,n=S.value;l=v(o,n),E(l)}L.addEventListener("click",u);x.addEventListener("keydown",o=>{o.key==="Enter"&&u()});w.addEventListener("click",()=>{l.length===0&&u();const o=l.map(n=>n.query);o.length!==0&&chrome.runtime.sendMessage({action:"openMultipleSearches",queries:o})});d.addEventListener("click",async()=>{l.length===0&&u();const o=l.map(n=>n.query).join(`
`);o&&(await navigator.clipboard.writeText(o),d.textContent="Copied",setTimeout(()=>{d.textContent="Copy all"},1e3))});E([]);
