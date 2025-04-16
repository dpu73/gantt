// ✅ GANTT2 - PATCHED script.js (zoom, rename, contrast)

let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";
let defaultDuration = 1;
let autoColorEnabled = true;
let colorIndex = 0;
let zoomLevel = 300; // px per day
let alignMode = "recent"; // or "selected"

const taskColors = ["#F8961E", "#577590", "#43AA8B", "#9A5AFF", "#F94144", "#F3722C", "#43A047", "#6A1B9A"];

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  editor.style.display = "block";
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

// PATCH: Zoom + Rename Handlers
document.getElementById("zoomIn").onclick = () => {
  zoomLevel = Math.min(zoomLevel + 50, 1000);
  renderTasks();
};

document.getElementById("zoomOut").onclick = () => {
  zoomLevel = Math.max(zoomLevel - 50, 50);
  renderTasks();
};

document.getElementById("applyProjectName").onclick = () => {
  const field = document.getElementById("projectNameField");
  if (field?.value.trim()) {
    projectName = field.value.trim();
    document.getElementById("projectTitle").textContent = projectName;
    showToast("📁 Project renamed");
  }
};

// PATCH: Improve subtask contrast
const subtaskStyles = document.createElement("style");
subtaskStyles.textContent = `
  .subtask {
    background-color: #e2e8f0 !important;
    color: #1e293b !important;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    margin-top: 0.2rem;
    font-size: 0.85em;
  }
`;
document.head.appendChild(subtaskStyles);

// === TAB SETUP ===
function setupTabControls() {
  const tabs = ["project", "task", "subtask", "timeline"];
  tabs.forEach(tab => {
    const btn = document.getElementById("tab" + capitalize(tab));
    btn.onclick = () => {
      if (btn.classList.contains("disabled")) return;
      editorTab = tab;
      renderTabs();
    };
  });
}

function renderTabs() {
  const tabMap = {
    project: "panelProject",
    task: "panelTask",
    subtask: "panelSubtask",
    timeline: "panelTimeline"
  };

   for (let key in tabMap) {
    const panel = document.getElementById(tabMap[key]);
    const btn = document.getElementById("tab" + capitalize(key));
    const isActive = editorTab === key;
    panel.classList.toggle("hidden", !isActive);
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("disabled", !canAccessTab(key));
  }

  if (editorTab === "task") renderTaskEditor();
  if (editorTab === "subtask") renderSubtaskEditor();
}

function canAccessTab(tab) {
  switch (tab) {
    case "project": return true;
    case "task": return !!selectedTaskId || tasks.length === 0;
    case "subtask": return !!selectedTaskId;
    case "timeline": return !!projectName;
    default: return false;
  }
}

// === SETTINGS ===
function setupSettings() {
  const toggle = document.getElementById("autoColorToggle");
  if (toggle) {
    toggle.checked = true;
    toggle.onchange = e => autoColorEnabled = e.target.checked;
  }

  const durationField = document.getElementById("defaultDuration");
  if (durationField) {
    durationField.onchange = e => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) defaultDuration = val;
    };
  }

  const gridToggle = document.getElementById("gridToggle");
  if (gridToggle) {
    gridToggle.checked = true;
    gridToggle.onchange = () => renderTasks();
  }

  document.querySelectorAll('input[name="alignMode"]').forEach(radio => {
    radio.onchange = e => {
      alignMode = e.target.value;
    };
  });
}

// === HELPER ===
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// === BUTTON SETUP ===
function setupButtons() {
  document.getElementById("newProject").onclick = () => {
    if (!confirm("Start a new project? Unsaved data will be lost.")) return;
    projectName = "Untitled Project";
    tasks = [];
    selectedTaskId = null;
    selectedSubtask = null;
    colorIndex = 0;
    const base = new Date().toISOString().split("T")[0];
    const task = createTask(base);
    task.name = "First Task";
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    selectedTaskId = task.id;
    selectedSubtask = null;
    editorTab = "task";
    renderTabs();
    renderTasks();
    document.getElementById("projectTitle").textContent = projectName;
  };

  document.getElementById("importBtn").onclick = () =>
    document.getElementById("fileInput").click();

  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      tasks = data.tasks || [];
      projectName = data.meta?.projectName || "Untitled Project";
      document.getElementById("projectTitle").textContent = projectName;
      selectedTaskId = tasks.length ? tasks[0].id : null;
      selectedSubtask = null;
      editorTab = "task";
      renderTabs();
      renderTasks();
    };
    reader.readAsText(file);
  };

  document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify({ meta: { projectName }, tasks }, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName.replace(/\s+/g, "_")}.json`;
    link.click();
  };

  document.getElementById("toggleEditor").onclick = () => {
    const editor = document.getElementById("editor");
    editor.style.display = editor.style.display === "none" ? "block" : "none";
  };
}
