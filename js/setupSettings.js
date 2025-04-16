// js/setupSettings.js
import { state } from './state.js';
import { renderTasks } from './renderTasks.js';

export function setupSettings() {
  const durField = document.getElementById("defaultDuration");
  if (durField) {
    durField.value = state.defaultDuration;
    durField.onchange = e => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) state.defaultDuration = val;
    };
  }

  const gridToggle = document.getElementById("gridToggle");
  if (gridToggle) {
    gridToggle.checked = true;
    gridToggle.onchange = () => renderTasks();
  }

  const colorToggle = document.getElementById("autoColorToggle");
  if (colorToggle) {
    colorToggle.checked = state.autoColorEnabled;
    colorToggle.onchange = e => state.autoColorEnabled = e.target.checked;
  }

  const alignRadios = document.querySelectorAll('input[name="alignMode"]');
  alignRadios.forEach(radio => {
    if (radio.value === state.alignMode) radio.checked = true;
    radio.onchange = e => state.alignMode = e.target.value;
  });

  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");

  if (zoomIn) zoomIn.onclick = () => {
    state.zoomLevel = Math.min(state.zoomLevel * 1.25, 800);
    renderTasks();
  };

  if (zoomOut) zoomOut.onclick = () => {
    state.zoomLevel = Math.max(state.zoomLevel / 1.25, 50);
    renderTasks();
  };
}
