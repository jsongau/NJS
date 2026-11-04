// The crew page: Goldsmith portraits on each card, then "Your agents": pick the agents to build
// for your business. Each pick adds its features to the same saved plan the builder uses, and the
// button carries that plan to /build, where it's sent or (once deposits open) paid.
import { $, $$, esc, weeksText, plural } from './util.js';
import { CREW_ART, CLIENT_AGENTS, AGENT_FACES } from './crewart.js';
import { agentPicks } from './picks.js';

export function mountCrew(store) {
  $$('.mate [data-art]').forEach((el) => { const a = CREW_ART[el.dataset.art]; if (a) { el.innerHTML = a; el.classList.add('has-art'); el.style.background = 'none'; } });
  $$('.mate').forEach((m) => { if (!m.hasAttribute('tabindex')) m.tabIndex = 0; });

  const grid = $('#agents-grid');
  if (!grid) return;
  const { actions } = store;
  grid.innerHTML = CLIENT_AGENTS.map((a) => '<button type="button" class="ag" data-ag="' + a.id + '" aria-pressed="false">' +
    '<span class="ag-top"><span class="ag-face">' + AGENT_FACES[a.id] + '</span><span class="ag-st"><span class="ag-st-t">Add</span></span></span>' +
    '<b>' + esc(a.name) + '</b><span class="ag-do">' + esc(a.does) + '</span><span class="ag-ex">Example. ' + esc(a.example) + '</span></button>').join('') +
    '<a class="ag ag-own" href="/build?call=1" data-carry><span class="ag-top"><span class="ag-face">' + AGENT_FACES.yours + '</span></span><b>Your agent here</b><span class="ag-do">Tell me the task you repeat every week. I scope an agent for it on the call.</span><span class="ag-ex">Custom, built for your project.</span></a>';

  const picks = agentPicks(store);
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('button.ag');
    if (b) picks.toggle(b.dataset.ag);
  });

  const go = $('#agents-go');
  if (go) go.addEventListener('click', (e) => {
    e.preventDefault();
    const { quote: q } = store.get();
    if (q.tier && q.tier.id === 'run') actions.setCarePlan('run');
    location.href = '/build' + (location.hash || '') ;
  });

  function paint({ quote: q }) {
    const n = picks.size;
    $$('button.ag', grid).forEach((b) => {
      const on = picks.has(b.dataset.ag);
      b.setAttribute('aria-pressed', on);
      b.classList.toggle('on', on);
      $('.ag-st-t', b).textContent = on ? 'In your plan' : 'Add';
    });
    const line = $('#agents-line');
    if (line) line.textContent = n ? plural(n, 'agent', 'agents') + ' picked. ' + (q.tier ? "That's a " + q.tier.label + ' build, about ' + weeksText(q.weeks) + ' weeks after the audit.' : '') : 'Pick the agents you want. They go straight into your plan.';
    if (go) go.textContent = n ? 'Build my plan with ' + plural(n, 'agent', 'agents') : 'Build my plan';
  }
  store.subscribe(paint);
  picks.subscribe(() => paint(store.get()));
}
