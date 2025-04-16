// js/setupSettings.js
import {
  defaultDuration, zoomLevel, autoColorEnabled, alignMode,
} from './state.js';

import { renderTasks } from './renderTasks.js';
import { renderEditor } from './renderEditor.js';

export function setupSettings() {
  const durField = document.getElementById("defaultDuration");
  if (durField) {
    durField.value = defaultDuration;
    durField.onchange = e => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) defaultDuration = val;
    };
  }

  const gridToggle = document.getElementById("gridToggle");
  if (gridToggle) {
    gridToggle.checked = true;
    gridToggle.onchange = () => renderTasks();
  }

  const colorToggle = document.getElementById("autoColorToggle");
  if (colorToggle) {
    colorToggle.checked = autoColorEnabled;
    colorToggle.onchange = e => autoColorEnabled = e.target.checked;
  }

  const alignRadios = document.querySelectorAll('input[name="alignMode"]');
  alignRadios.forEach(radio => {
    if (radio.value === alignMode) radio.checked = true;
    radio.onchange = e => alignMode = e.target.value;
  });

  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");

  if (zoomIn) zoomIn.onclick = () => {
    zoomLevel = Math.min(zoomLevel * 1.25, 800);
    renderTasks();
  };

  if (zoomOut) zoomOut.onclick = () => {
    zoomLevel = Math.max(zoomLevel / 1.25, 50);
    renderTasks();
  };
}
