// js/setupTabs.js
import { selectedTaskId, selectedSubtask } from './state.js';
import { renderEditor } from './renderEditor.js';

export function setupTabs() {
  const tabs = ["project", "task", "subtask", "timeline"];

  tabs.forEach(tab => {
    const btn = document.getElementById("tab" + capitalize(tab));
    if (!btn) return;

    btn.onclick = () => {
      if (btn.classList.contains("disabled")) return;
      renderEditor(); // no tab switching anymore, just context-aware updates
    };
  });
}

export function renderTabs() {
  const show = (id, show = true) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !show);
  };

  show("projectToolbar", !selectedTaskId && !selectedSubtask);
  show("taskToolbar", !!selectedTaskId && !selectedSubtask);
  show("subtaskToolbar", !!selectedSubtask);
}
