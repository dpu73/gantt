let tasks = [];
let selectedTaskId = null;
let selectedSubtask = null;
let projectName = "Untitled Project";
let editorTab = "project";
let defaultDuration = 1;
let autoColorEnabled = true;
let colorIndex = 0;
let zoomLevel = 300; // px per day

const taskColors = ["#F8961E", "#577590", "#43AA8B", "#9A5AFF", "#F94144", "#F3722C", "#43A047", "#6A1B9A"];

document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  editor.style.display = "block";
  setupTabControls();
  setupButtons();
  setupSettings();
  renderTabs();
  renderTasks();
});

function setupButtons() {
  document.getElementById("applyProjectName").onclick = () => {
    projectName = document.getElementById("projectNameField").value;
    document.getElementById("projectTitle").textContent = projectName;
  };

  document.getElementById("newProject").onclick = () => {
    if (!confirm("Start a new project? Unsaved data will be lost.")) return;
    projectName = "Untitled Project";
    tasks = [];
    selectedTaskId = null;
    selectedSubtask = null;
    colorIndex = 0;
    document.getElementById("projectTitle").textContent = projectName;
    renderTabs();
    renderTasks();
  };

  document.getElementById("importBtn").onclick = () => document.getElementById("fileInput").click();
  document.getElementById("fileInput").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const data = JSON.parse(event.target.result);
      tasks = data.tasks || [];
      projectName = data.meta?.projectName || "Untitled Project";
      document.getElementById("projectTitle").textContent = projectName;
      renderTasks();
      renderTabs();
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

  document.getElementById("addPrimaryStart").onclick = () => {
    const last = tasks[tasks.length - 1];
    const base = last?.start || new Date().toISOString().split("T")[0];
    const task = createTask(base);
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    renderTasks();
  };

  document.getElementById("addPrimaryEnd").onclick = () => {
    const last = tasks[tasks.length - 1];
    const base = last?.end || new Date().toISOString().split("T")[0];
    const task = createTask(base);
    task.end = addDays(task.start, defaultDuration);
    tasks.push(task);
    renderTasks();
  };

  document.getElementById("addSub").onclick = () => {
    if (!selectedTaskId) return alert("Select a task first.");
    const parent = findTaskById(selectedTaskId);
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
    editorTab = "subtask";
    renderTabs();
    renderTasks();
  };

  document.getElementById("deleteTask").onclick = () => {
    if (!selectedTaskId) return;
    if (confirm("Delete this task and its subtasks?")) {
      tasks = tasks.filter(t => t.id !== selectedTaskId);
      selectedTaskId = null;
      selectedSubtask = null;
      renderTabs();
      renderTasks();
    }
  };

  document.getElementById("zoomIn").onclick = () => {
    zoomLevel = Math.min(zoomLevel * 1.25, 800);
    renderTasks();
  };

  document.getElementById("zoomOut").onclick = () => {
    zoomLevel = Math.max(zoomLevel / 1.25, 50);
    renderTasks();
  };

  document.getElementById("collapseAll").onclick = () => {
    tasks.forEach(t => t.expanded = false);
    renderTasks();
  };

  document.getElementById("expandAll").onclick = () => {
    tasks.forEach(t => t.expanded = true);
    renderTasks();
  };
}
