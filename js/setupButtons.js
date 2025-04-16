// js/setupButtons.js
import { state } from './state.js';
import { renderEditor } from './renderEditor.js';
import { renderTasks } from './renderTasks.js';
import { showToast } from './helpers.js';

export function setupButtons() {
  // 📁 New Project
  document.getElementById("newProject").onclick = () => {
    if (!confirm("Start a new project? Unsaved data will be lost.")) return;

    state.tasks.length = 0;
    const first = {
      id: Date.now(),
      name: "First Task",
      start: today,
      end: addDays(today, state.defaultDuration),
      color: "#F8961E",
      status: "future",
      assigned: "",
      notes: "",
      subtasks: [],
      expanded: true
    };
    
	state.tasks.push(first);
    state.selectedTaskId = first.id;
    state.selectedSubtask = null;

    renderEditor();
    renderTasks();
  };

  // 📤 Export
  document.getElementById("exportBtn").onclick = () => {
    const data = {
      meta: { projectName: state.projectName },
      tasks: state.tasks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${state.projectName.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  // 📥 Import
  document.getElementById("importBtn").onclick = () =>
    document.getElementById("fileInput").click();

  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      tasks.length = 0;
      tasks.push(...(data.tasks || []));
      selectedTaskId = tasks[0]?.id || null;
      selectedSubtask = null;
      renderTasks();
      renderEditor();
    };
    reader.readAsText(file);
  };

  // 🧱 Add Primary Task
  document.getElementById("addPrimaryTask").onclick = () => {
    const selected = state.tasks.find(t => t.id === state.selectedTaskId);
    const last = state.tasks[tasks.tasks.length - 1];

    const base = state.alignMode === "selected" && selected
      ? selected.end
      : last?.end || new Date().toISOString().split("T")[0];

    const task = {
      id: Date.now(),
      name: "New Task",
      start: base,
      end: addDays(base, defaultDuration),
      color: "#F8961E",
      status: "future",
      assigned: "",
      notes: "",
      subtasks: [],
      expanded: true
    };

    tasks.push(task);
    selectedTaskId = task.id;
    selectedSubtask = null;

    renderEditor();
    renderTasks();
  };

  // 🗑️ Delete Primary Task
  document.getElementById("deleteTaskFromEditor").onclick = () => {
    if (!selectedTaskId) return;

    const index = tasks.findIndex(t => t.id === selectedTaskId);
    if (index === -1) return;

    tasks.splice(index, 1);
    selectedTaskId = null;
    selectedSubtask = null;

    renderEditor();
    renderTasks();
  };

  // ➕ Add Subtask
  document.getElementById("addSub").onclick = () => {
    if (!selectedTaskId) return;
    const parent = tasks.find(t => t.id === selectedTaskId);
    if (!parent) return;

    const sub = {
      id: Date.now(),
      name: "New Subtask",
      start: parent.start,
      end: addDays(parent.start, 2),
      status: "future",
      assigned: ""
    };

    parent.subtasks.push(sub);
    selectedSubtask = sub;

    renderEditor();
    renderTasks();
  };

  // 🗑️ Delete Subtask
  document.getElementById("deleteSubtask").onclick = () => {
    if (!selectedTaskId || !selectedSubtask) return;
    const parent = tasks.find(t => t.id === selectedTaskId);
    if (!parent) return;

    parent.subtasks = parent.subtasks.filter(s => s.id !== selectedSubtask.id);
    selectedSubtask = null;

    renderEditor();
    renderTasks();
  };
}

// 🔧 Utility
function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
