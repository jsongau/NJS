// Agent picks, shared by the crew page and the menu: one set per viewer (localStorage), and each
// pick adds the features that agent needs to the same saved plan the builder uses. Two agents can
// share a feature, so a feature is only dropped when no picked agent still needs it.
import { CLIENT_AGENTS } from './crewart.js';

const KEY = 'njs-agents-v1';
const byId = Object.fromEntries(CLIENT_AGENTS.map((a) => [a.id, a]));
const made = new WeakMap();

export function agentPicks(store) {
  if (made.has(store)) return made.get(store);
  let picked = new Set();
  try { picked = new Set(JSON.parse(localStorage.getItem(KEY) || '[]').filter((id) => byId[id])); } catch (_) { /* private mode */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch (_) { /* private mode */ } };
  const need = () => new Set([...picked].flatMap((id) => byId[id].features));
  const subs = new Set();
  const emit = () => subs.forEach((fn) => fn(picked));
  const api = {
    has: (id) => picked.has(id),
    get size() { return picked.size; },
    ids: () => [...picked],
    toggle(id) {
      if (!byId[id]) return;
      const before = need();
      if (picked.has(id)) picked.delete(id); else picked.add(id);
      save();
      const after = need();
      const cur = new Set(store.get().sel.features);
      for (const f of after) if (!cur.has(f)) store.actions.toggleFeature(f);
      for (const f of before) if (!after.has(f) && cur.has(f)) store.actions.toggleFeature(f);
      emit();
    },
    // After a plan switch resets the features, put back what the picked agents need.
    reapply() {
      const cur = new Set(store.get().sel.features);
      for (const f of need()) if (!cur.has(f)) store.actions.toggleFeature(f);
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
  store.subscribe((state) => {
    // A feature dropped elsewhere (the builder, the summary) un-picks the agents that needed it.
    const f = new Set(state.sel.features);
    let changed = false;
    for (const id of [...picked]) if (!byId[id].features.every((x) => f.has(x))) { picked.delete(id); changed = true; }
    if (changed) { save(); emit(); }
  });
  made.set(store, api);
  return api;
}
