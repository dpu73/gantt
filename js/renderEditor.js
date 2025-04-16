import { state } from './state.js';

import { renderTasks } from './renderTasks.js';
import { showToast } from './helpers.js';

// 🔧 Update project name display
function updateProjectHeader() {
  const title = document.getElementById("projectTitle");
  if (title) title.textContent = projectName;
}

// 🔧 Inject editor fields based on selection
export function renderEditor() {
  const container = document.getElementById("editorFields");
  const projectTools = document.getElementById("projectToolbar");
  const taskTools = document.getElementById("taskToolbar");
  const subtaskTools = document.getElementById("subtaskToolbar");

  if (!container) return;

  // Reset
  container.innerHTML = "";
  projectTools?.classList.add("hidden");
  taskTools?.classList.add("hidden");
  subtaskTools?.classList.add("hidden");

  updateProjectHeader();

  // --- Project view (default)
  if (!selectedTaskId && !selectedSubtask) {
    projectTools?.classList.remove("hidden");

    container.innerHTML = `
      <label>Project Name:
        <input type="text" id="projectNameField" value="${projectName}" />
      </label>
    `;

    document.getElementById("projectNameField").oninput = (e) => {
      const newName = e.target.value;
      document.getElementById("projectTitle").textContent = newName;
    };

    return;
  }

  // --- Subtask view
  if (selectedSubtask) {
    const sub = selectedSubtask;
    subtaskTools?.classList.remove("hidden");

    container.innerHTML = `
      <label>Subtask Name: <input type="text" id="subName" value="${sub.name}" /></label>
      <label>Start: <input type="date" id="subStart" value="${sub.start}" /></label>
      <label>End: <input type="date" id="subEnd" value="${sub.end}" /></label>
      <label>Status:
        <select id="subStatus">
          <option value="future">Future</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="complete">Complete</option>
        </select>
      </label>
      <label>Assigned To: <input type="text" id="subAssigned" value="${sub.assigned}" /></label>
    `;

    document.getElementById("subStatus").value = sub.status;

    document.getElementById("subName").oninput = e => sub.name = e.target.value;
    document.getElementById("subStart").onchange = e => sub.start = e.target.value;
    document.getElementById("subEnd").onchange = e => sub.end = e.target.value;
    document.getElementById("subStatus").onchange = e => sub.status = e.target.value;
    document.getElementById("subAssigned").oninput = e => sub.assigned = e.target.value;
    return;
  }

  // --- Primary task view
  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task) return;

  taskTools?.classList.remove("hidden");

  container.innerHTML = `
    <label>Task Name: <input type="text" id="taskName" value="${task.name}" /></label>
    <label>Start: <input type="date" id="taskStart" value="${task.start}" /></label>
    <label>End: <input type="date" id="taskEnd" value="${task.end}" /></label>
    <label>Status:
      <select id="taskStatus">
        <option value="future">Future</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="complete">Complete</option>
      </select>
    </label>
    <label>Notes: <textarea id="taskNotes">${task.notes}</textarea></label>
    <label>Assigned To: <input type="text" id="taskAssigned" value="${task.assigned}" /></label>
  `;

  document.getElementById("taskStatus").value = task.status;

  document.getElementById("taskName").oninput = e => task.name = e.target.value;
  document.getElementById("taskStart").onchange = e => task.start = e.target.value;
  document.getElementById("taskEnd").onchange = e => task.end = e.target.value;
  document.getElementById("taskStatus").onchange = e => task.status = e.target.value;
  document.getElementById("taskNotes").oninput = e => task.notes = e.target.value;
  document.getElementById("taskAssigned").oninput = e => task.assigned = e.target.value;

  renderTasks();
}
