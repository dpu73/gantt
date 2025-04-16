// script.js (entry point for GANTT2 v0.4.x)
import { initState } from './js/state.js';
import { setupTabs, renderTabs } from './js/setupTabs.js';
import { setupButtons } from './js/setupButtons.js';
import { setupSettings } from './js/setupSettings.js';
import { renderTasks } from './js/renderTasks.js';
import { renderEditor } from './js/renderEditor.js';

document.addEventListener("DOMContentLoaded", () => {
  initState();
  setupTabs();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
  renderEditor(); // initial render based on default project state
});
