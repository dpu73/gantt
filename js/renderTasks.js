// js/renderTasks.js

import { state } from './state.js';
import { renderEditor } from './renderEditor.js';
import {
  getTaskDuration,
  getContrastColor,
  dateToOffset,
  addDays
} from './helpers.js';


export function renderTasks() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;
  timeline.innerHTML = "";

  if (!tasks.length) return;

  const projectStart = tasks[0].start;
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.minHeight = "600px";
  wrapper.style.width = (tasks.length * zoomLevel * 2 + 1000) + "px";



  const showGrid = document.getElementById("gridToggle")?.checked;
  wrapper.style.backgroundImage = showGrid
    ? "linear-gradient(to right, #eee 1px, transparent 1px)"
    : "none";
  wrapper.style.backgroundSize = `${zoomLevel}px 100%`;

  state.tasks.forEach((task, i) => {
    const div = document.createElement("div");
    div.className = "task";
    if (task.id === state.selectedTaskId) {
      div.classList.add("selected");
    }

    div.style.backgroundColor = task.color || "#F8961E";
    div.style.color = getContrastColor(task.color);
    div.style.position = "absolute";
    div.style.top = `${i * 80}px`;
    div.style.left = dateToOffset(task.start, projectStart) + "px";
    div.style.width = (zoomLevel * getTaskDuration(task)) + "px";
    div.style.padding = "0.5rem";
    div.style.borderRadius = "6px";
    div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.2)";

    // Subtask renderer
    let subtaskHTML = "";
    if (task.expanded !== false && task.subtasks?.length) {
      subtaskHTML = task.subtasks.map(st => {
        const isSelected = selectedSubtask && st.id === selectedSubtask.id;
        return `
          <div class="subtask${isSelected ? ' selected' : ''}"
               onclick="editSubtask(${task.id}, ${st.id}); event.stopPropagation();">
            - ${st.name}
          </div>
        `;
      }).join("");
    }

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${task.name}</strong>
        ${task.subtasks?.length
          ? `<span style="cursor:pointer;" onclick="toggleSubtasks(${task.id}); event.stopPropagation();">${task.expanded ? "▾" : "▸"}</span>`
          : ""}
      </div>
      <div style="font-size:0.9em;">🕓 ${task.start} → ${task.end}</div>
      ${subtaskHTML}
    `;

    div.onclick = () => {
      selectedTaskId = task.id;
      selectedSubtask = null;
      renderEditor();
      renderTasks();
    };

makeTaskDraggable(div, task); 
    wrapper.appendChild(div);
  });

  timeline.appendChild(wrapper);
}
